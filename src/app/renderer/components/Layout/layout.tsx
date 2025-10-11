import { SidebarProvider, SidebarTrigger } from '@shadcn/components/ui/sidebar';
import { AppSidebar } from '@components/AppSidebar/AppSidebar';

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
