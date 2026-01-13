import { IconColorSwatch, IconSettings } from '@tabler/icons-react';

import { TreeDataItem, TreeView } from '@renderer/shadcn/components/tree-view';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@shadcn/components/ui/sidebar';

const settingsMenu: TreeDataItem[] = [
  { id: 'general', name: 'General', icon: IconSettings },
  { id: 'colors', name: 'Colors', icon: IconColorSwatch },
];

export interface SettingsSidebarProps {
  selectedItemId?: string;
  onSelectionChange?: (id: string) => void;
}

export function SettingsSidebar({ selectedItemId, onSelectionChange }: SettingsSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TreeView
                data={settingsMenu}
                initialSelectedItemId={selectedItemId}
                onSelectChange={(item) => {
                  if (!item) {
                    return;
                  }
                  onSelectionChange?.(item.id);
                }}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
