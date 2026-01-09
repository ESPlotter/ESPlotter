import { JSX } from 'react';

import { SettingsLayout } from '@renderer/components/Layout/SettingsLayout';
import { useUserPreferences } from '@renderer/hooks/useUserPreferences';

import { ChartSeriePaletteColorSetting } from './components/ChartSeriePaletteColorSetting';
import { DataTableFormatSetting } from './components/DataTableFormatSetting';

export function UserPreferencesPage(): JSX.Element {
  useUserPreferences();

  return (
    <SettingsLayout>
      <ChartSeriePaletteColorSetting />
      <DataTableFormatSetting />
    </SettingsLayout>
  );
}
