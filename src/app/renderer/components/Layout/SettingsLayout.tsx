import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

import { Button } from '@renderer/shadcn/components/ui/button';
import { SidebarProvider } from '@shadcn/components/ui/sidebar';

import { SettingsSidebar } from '../SettingsSidebar/SettingsSidebar';

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <SettingsSidebar />
      <main className="w-full">
        <div className="flex items-center justify-end border-b px-2">
          <Button variant="outline" className="m-4" onClick={() => navigate('/')}>
            <IconPlus /> Close
          </Button>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
