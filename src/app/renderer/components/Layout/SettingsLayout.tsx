import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

import { Button } from '@renderer/shadcn/components/ui/button';
import { SidebarProvider } from '@shadcn/components/ui/sidebar';

import { SettingsSidebar, type SettingsSidebarProps } from '../SettingsSidebar/SettingsSidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
  sidebarProps?: SettingsSidebarProps;
}

export function SettingsLayout({ children, sidebarProps }: SettingsLayoutProps) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <SettingsSidebar {...sidebarProps} />
      <main className="min-w-0 flex-1">
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
