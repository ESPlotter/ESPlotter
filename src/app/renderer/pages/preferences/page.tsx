import { JSX, useState } from 'react';

import { SettingsLayout } from '@renderer/components/Layout/SettingsLayout';
import { useUserPreferences } from '@renderer/hooks/useUserPreferences';

import { ChartSeriePaletteColorSetting } from './components/ChartSeriePaletteColorSetting';
import { GeneralSettings } from './components/GeneralSettings';

type PreferencesMenuId = 'general' | 'colors';

export function UserPreferencesPage(): JSX.Element {
  useUserPreferences();
  const [selectedMenu, setSelectedMenu] = useState<PreferencesMenuId>('general');

  return (
    <SettingsLayout
      sidebarProps={{
        selectedItemId: selectedMenu,
        onSelectionChange: (id) => {
          if (id === 'general' || id === 'colors') {
            setSelectedMenu(id);
          }
        },
      }}
    >
      {selectedMenu === 'general' && <GeneralSettings />}
      {selectedMenu === 'colors' && <ChartSeriePaletteColorSetting />}
    </SettingsLayout>
  );
}
