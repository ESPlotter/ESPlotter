import { IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';

import { AppSidebar } from '@components/AppSidebar/AppSidebar';
import { Button } from '@renderer/shadcn/components/ui/button';
import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { SidebarProvider } from '@shadcn/components/ui/sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { addChart } = useChannelChartsActions();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-full flex-col">
        <div className="flex shrink-0 items-center justify-end border-b px-4 py-2">
          {/* <SidebarTrigger /> */}
          <Button variant="outline" className="m-4" onClick={() => addChart(nanoid())}>
            <IconPlus /> New Chart
          </Button>
        </div>
        <section className="flex-1 overflow-auto p-4">{children}</section>
      </main>
    </SidebarProvider>
  );
}
