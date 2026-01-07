import { IconColorSwatch } from '@tabler/icons-react';

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
  { id: '1', name: 'Colors', icon: IconColorSwatch, onClick: () => {}, actions: [] },
];

export function SettingsSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TreeView data={settingsMenu} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
