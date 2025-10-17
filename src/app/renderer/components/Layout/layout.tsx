import { AppSidebar } from '@components/AppSidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@shadcn/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
