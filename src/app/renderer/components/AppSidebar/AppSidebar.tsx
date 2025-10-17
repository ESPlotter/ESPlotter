import { useMemo } from 'react';

import { useOpenedChannelFiles } from '@renderer/hooks/useOpenedChannelFiles';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@shadcn/components/ui/accordion';
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
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

interface ChannelFile {
  fileName: string;
  children: Channels[];
}

interface Channels {
  label: string;
  id: string;
  unit: string;
}

export function AppSidebar() {
  const openedChannelFiles = useOpenedChannelFiles();

  const allItems = useMemo(() => {
    return openedChannelFiles.map(mapToMenuItems);
  }, [openedChannelFiles]);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CHANNELS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
                <Accordion type="single" collapsible key={item.fileName}>
                  <AccordionItem value={item.fileName}>
                    <AccordionTrigger className="text-sm font-medium">
                      {item.fileName}
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.children?.map((child) => (
                        <SidebarMenuItem key={child.label}>
                          <SidebarMenuButton asChild>
                            <span>
                              {child.label}
                              {child.unit ? ` (${child.unit})` : ''}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function mapToMenuItems(data: ChannelFilePrimitive): ChannelFile {
  return {
    fileName: getFileName(data.path),
    children: data.content.series.map((s) => ({
      id: s.id,
      label: s.label,
      unit: s.unit,
    })),
  };

  function getFileName(filePath: string): string {
    return (
      filePath
        .split(/[\\/]/)
        .pop()
        ?.replace(/\.[^/.]+$/, '') || 'test'
    );
  }
}
