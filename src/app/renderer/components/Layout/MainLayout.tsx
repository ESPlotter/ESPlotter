import { IconCamera, IconPlus, IconTrash } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useCallback, useEffect } from 'react';

import { AppSidebar } from '@components/AppSidebar/AppSidebar';
import { captureVisibleChartsToClipboard } from '@renderer/components/Chart/captureVisibleCharts';
import { Button } from '@renderer/shadcn/components/ui/button';
import { useChannelChartsActions, useCharts } from '@renderer/store/ChannelChartsStore';
import { SidebarProvider } from '@shadcn/components/ui/sidebar';

import { isTypingTarget } from '../Chart/useChartHotKey';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { addChart, removeAllCharts } = useChannelChartsActions();
  const charts = useCharts();
  const chartCount = Object.keys(charts).length;
  const shouldShowCaptureButton = chartCount > 1;
  const shouldShowDeleteAllButton = chartCount > 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.ctrlKey && e.key === 'Delete') {
        e.preventDefault();
        removeAllCharts();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeAllCharts]);

  const handleCopyVisibleCharts = useCallback(function handleCopyVisibleCharts() {
    void captureVisibleChartsToClipboard();
  }, []);

  useEffect(() => {
    if (!shouldShowCaptureButton) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (isTypingTarget(event.target)) return;
      if (event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleCopyVisibleCharts();
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCopyVisibleCharts, shouldShowCaptureButton]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 justify-end border-b px-4 py-2">
          {/* <SidebarTrigger /> */}
          {shouldShowCaptureButton ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyVisibleCharts}
              aria-label="Copy visible charts"
              title="Copy visible charts (Shift+S)"
            >
              <IconCamera />
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => addChart(nanoid())}>
            <IconPlus /> New Chart
          </Button>
          {shouldShowDeleteAllButton ? (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={removeAllCharts}
              title="Delete all charts (Ctrl+Delete)"
            >
              <IconTrash className="size-4 text-red-600" />
            </Button>
          ) : null}
        </div>
        <section className="flex-1 overflow-auto p-4" data-testid="chart-scroll-container">
          {children}
        </section>
      </main>
    </SidebarProvider>
  );
}
