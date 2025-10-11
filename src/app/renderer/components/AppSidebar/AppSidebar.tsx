import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shadcn/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { AllowedFileStructure } from '@shared/AllowedFileStructure';

interface MenuItem {
  label: string;
  unit: string;
}

export function AppSidebar() {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const offLast = window.files.onLastOpenedFileParsedChanged((file) => {
      setItems(mapAllowedFileStructureToMenuItems(file.data));
    });

    (async () => {
      const file = await window.files.getLastOpenedFile();
      if (file) {
        setItems(mapAllowedFileStructureToMenuItems(file.data));
      }
    })();

    return () => {
      offLast();
    };
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function mapAllowedFileStructureToMenuItems(data: AllowedFileStructure): MenuItem[] {
  return data.series.map((item) => ({
    label: item.label,
    unit: item.unit,
  }));
}
