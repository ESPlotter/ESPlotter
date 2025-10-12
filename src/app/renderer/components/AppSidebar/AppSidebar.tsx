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
import { AllowedFileStructure } from '@shared/AllowedFileStructure';

interface MenuItem {
  label: string;
  unit?: string;
  children?: MenuItem[];
}

export function AppSidebar() {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const offLast = window.files.onLastOpenedFileParsedChanged((file) => {
      const lastPart = getLastPart(file.path);
      setItems((prev) => [...prev, ...mapAllowedFileStructureToMenuItems(file.data, lastPart)]);
    });

    (async () => {
      const file = await window.files.getLastOpenedFile();
      if (file) {
        const lastPart = getLastPart(file.path);
        setItems((prev) => [...prev, ...mapAllowedFileStructureToMenuItems(file.data, lastPart)]);
      }
    })();

    return () => offLast();
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
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
  data: AllowedFileStructure,
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
