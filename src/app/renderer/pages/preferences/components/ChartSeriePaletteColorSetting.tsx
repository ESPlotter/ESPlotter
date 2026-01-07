import { PlusIcon, RotateCcwIcon } from 'lucide-react';

import { Button } from '@renderer/shadcn/components/ui/button';
import {
  useUserPreferencesActions,
  useUserPreferencesChartSeriesPalette,
} from '@renderer/store/UserPreferencesStore';

import { ChartSeriePaletteColorItemSetting } from './ChartSeriePaletteColorItemSetting';

export function ChartSeriePaletteColorSetting() {
  const palette = useUserPreferencesChartSeriesPalette();
  const { replaceColor, addColor, removeColor, reorder, resetToDefaults, setChartSeriesPalette } =
    useUserPreferencesActions();

  return (
    <section className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => resetToDefaults()}>
            <RotateCcwIcon className="mr-2 size-4" /> Reset to defaults
          </Button>
          <Button onClick={() => addColor()} variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" /> Add colour
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {palette.length === 0 && (
          <p className="text-sm text-muted-foreground">
            The palette is empty. Random colors will be generated when charts need them.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {palette.map((color, index) => (
            <ChartSeriePaletteColorItemSetting
              defaultColor={color}
              index={index}
              key={`${color}-${index}`}
              onChange={(newColor) => replaceColor(index, newColor)}
              onRemove={(idx) => removeColor(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
