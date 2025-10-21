import { IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';

import { AppSidebar } from '@components/AppSidebar/AppSidebar';
import { Button } from '@renderer/shadcn/components/ui/button';
import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { SidebarProvider } from '@shadcn/components/ui/sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { addChart } = useChannelChartsActions();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center justify-end border-b px-2">
          {/* <SidebarTrigger /> */}
          <Button variant="outline" className="m-4" onClick={() => addChart(nanoid())}>
            <IconPlus /> New Chart
          </Button>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
