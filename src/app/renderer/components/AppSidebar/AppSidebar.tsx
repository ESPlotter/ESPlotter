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

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@shadcn/components/ui/accordion';

import { useEffect, useState } from 'react';
import { ChannelFileContentPrimitive } from '@shared/Domain/Primitives/ChannelFileContentPrimitive';

interface MenuItem {
  label: string;
  unit?: string;
  children?: MenuItem[];
}

export function AppSidebar() {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const offLast = window.files.onLastOpenedFileChanged((file) => {
      const lastPart = getLastPart(file.path);
      setItems((prevItems) => [
        ...prevItems,
        ...mapAllowedFileStructureToMenuItems(file.content, lastPart),
      ]);
    });
    (async () => {
      const files = await window.files.getOpenedChannelFiles();
      if (files && files.length > 0) {
        const allItems = files.flatMap((file) => {
          const lastPart = getLastPart(file.path);
          return mapAllowedFileStructureToMenuItems(file.content, lastPart);
        });
        setItems(allItems);
      }
    })();

    return () => offLast();
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CHANNELS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Accordion type="single" collapsible key={item.label}>
                  <AccordionItem value={item.label}>
                    <AccordionTrigger className="text-sm font-medium">
                      {item.label}
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

function mapAllowedFileStructureToMenuItems(
  data: ChannelFileContentPrimitive,
  lastPart?: string,
): MenuItem[] {
  return [
    {
      label: lastPart || 'test',
      children: data.series.map((s) => ({
        label: s.label,
        unit: s.unit,
      })),
    },
  ];
}

function getLastPart(filePath: string): string {
  const lastPart: string =
    filePath
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.[^/.]+$/, '') || 'test';

  return lastPart;
}
