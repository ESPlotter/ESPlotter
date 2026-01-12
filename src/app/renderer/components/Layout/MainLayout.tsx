import { IconCamera, IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';

import { AppSidebar } from '@components/AppSidebar/AppSidebar';
import { captureVisibleChartsToClipboard } from '@renderer/components/Chart/captureVisibleCharts';
import { Button } from '@renderer/shadcn/components/ui/button';
import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { SidebarProvider } from '@shadcn/components/ui/sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { addChart } = useChannelChartsActions();

  function handleCopyVisibleCharts() {
    void captureVisibleChartsToClipboard();
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-full flex-col">
        <div className="flex shrink-0 items-center gap-2 justify-end border-b px-4 py-2">
          {/* <SidebarTrigger /> */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyVisibleCharts}
            aria-label="Copy visible charts"
            title="Copy visible charts"
          >
            <IconCamera />
          </Button>
          <Button variant="outline" onClick={() => addChart(nanoid())}>
            <IconPlus /> New Chart
          </Button>
        </div>
        <section className="flex-1 overflow-auto p-4" data-testid="chart-scroll-container">
          {children}
        </section>
      </main>
    </SidebarProvider>
  );
}
