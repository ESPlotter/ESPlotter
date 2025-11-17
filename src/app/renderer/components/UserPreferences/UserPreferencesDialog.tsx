import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import { JSX, useState } from 'react';

import {
  useUserPreferencesActions,
  useUserPreferencesChartSeriesPalette,
  useUserPreferencesDialogState,
  useUserPreferencesValidationErrors,
} from '@renderer/store/UserPreferencesStore';
import { Button } from '@shadcn/components/ui/button';
import { Input } from '@shadcn/components/ui/input';
import { Separator } from '@shadcn/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@shadcn/components/ui/sheet';
import { normalizeChartSeriesColor } from '@shared/domain/validators/normalizeChartSeriesColor';

export function UserPreferencesDialog(): JSX.Element {
  const palette = useUserPreferencesChartSeriesPalette();
  const isDialogOpen = useUserPreferencesDialogState();
  const validationErrors = useUserPreferencesValidationErrors();
  const {
    replaceColor,
    addColor,
    removeColor,
    reorder,
    resetToDefaults,
    closeDialog,
    setChartSeriesPalette,
  } = useUserPreferencesActions();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const invalidIndices = new Set<number>();
  palette.forEach((color, index) => {
    if (!normalizeChartSeriesColor(color)) {
      invalidIndices.add(index);
    }
  });

  async function handleSave() {
    if (validationErrors.length > 0 || invalidIndices.size > 0) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      const normalizedPalette = palette.map((color) => normalizeChartSeriesColor(color) ?? color);
      const preferences = await window.userPreferences.updateChartSeriesPalette(normalizedPalette);
      setChartSeriesPalette(preferences.chartSeriesPalette);
      closeDialog();
    } catch {
      setSaveError('Unable to save preferences right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    try {
      const persistedPalette = await window.userPreferences.getChartSeriesPalette();
      setChartSeriesPalette(persistedPalette);
    } catch {
      // ignore errors and keep local state
    }
    setSaveError(null);
    closeDialog();
  }

  return (
    <Sheet open={isDialogOpen} onOpenChange={(open) => (!open ? void handleCancel() : undefined)}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>User Preferences</SheetTitle>
          <SheetDescription>Organize the chart series palette used across all charts.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Chart Series Palette
            </h2>
            <Button variant="ghost" size="sm" onClick={() => resetToDefaults()}>
              <RotateCcwIcon className="mr-2 size-4" /> Reset to defaults
            </Button>
          </div>
          <Separator />

          <div className="flex flex-col gap-3">
            {palette.length === 0 && (
              <p className="text-sm text-muted-foreground">
                The palette is empty. Random colors will be generated when charts need them.
              </p>
            )}
            {palette.map((color, index) => (
              <PaletteRow
                key={`${color}-${index}`}
                value={color}
                index={index}
                total={palette.length}
                onChangeColor={(value) => replaceColor(index, value)}
                onRemove={() => removeColor(index)}
                onMoveUp={() => reorder(index, index - 1)}
                onMoveDown={() => reorder(index, index + 1)}
                isInvalid={invalidIndices.has(index)}
              />
            ))}
          </div>

          <div>
            <Button onClick={() => addColor()} variant="outline" className="w-full">
              <PlusIcon className="mr-2 size-4" /> Add colour
            </Button>
          </div>
        </div>

        <SheetFooter>
          {(validationErrors.length > 0 || saveError) && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <ul className="list-disc space-y-1 pl-4">
                {validationErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
                {saveError && <li>{saveError}</li>}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => void handleCancel()} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={isSaving || validationErrors.length > 0 || invalidIndices.size > 0}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PaletteRow({
  value,
  index,
  total,
  onChangeColor,
  onRemove,
  onMoveUp,
  onMoveDown,
  isInvalid,
}: {
  value: string;
  index: number;
  total: number;
  onChangeColor: (value: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isInvalid: boolean;
}) {
  const normalized = normalizeChartSeriesColor(value) ?? 'rgb(0, 0, 0)';
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const channels = parseColorChannels(value);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Pick colour ${index + 1}`}
          className="h-10 w-14 rounded-md border border-border transition-transform focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ backgroundColor: normalized }}
          onClick={() => setIsPickerOpen((current) => !current)}
        />
        <Input
          value={value}
          onChange={(event) => onChangeColor(event.target.value)}
          aria-label={`Colour ${index + 1}`}
          className={isInvalid ? 'border-destructive focus-visible:ring-destructive' : undefined}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Position {index + 1}</div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsPickerOpen((open) => !open)}
            aria-label={isPickerOpen ? 'Hide colour sliders' : 'Adjust colour with sliders'}
          >
            <SlidersHorizontalIcon className={`size-4 ${isPickerOpen ? 'text-foreground' : ''}`} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ArrowUpIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            <ArrowDownIcon className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>
      {isPickerOpen && (
        <div className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
          <ChannelSlider
            label="Red"
            value={channels.r}
            max={255}
            onChange={(next) => onChangeColor(fromChannels({ ...channels, r: next }))}
          />
          <ChannelSlider
            label="Green"
            value={channels.g}
            max={255}
            onChange={(next) => onChangeColor(fromChannels({ ...channels, g: next }))}
          />
          <ChannelSlider
            label="Blue"
            value={channels.b}
            max={255}
            onChange={(next) => onChangeColor(fromChannels({ ...channels, b: next }))}
          />
          <ChannelSlider
            label="Opacity"
            value={Math.round(channels.a * 100)}
            max={100}
            step={1}
            onChange={(next) =>
              onChangeColor(fromChannels({ ...channels, a: Number((next / 100).toFixed(2)) }))
            }
          />
        </div>
      )}
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
          className="flex-1"
        />
        <span className="w-12 text-right text-foreground text-xs">{value}</span>
      </div>
    </label>
  );
}

function parseColorChannels(color: string): { r: number; g: number; b: number; a: number } {
  const normalized = normalizeChartSeriesColor(color) ?? 'rgb(0, 0, 0)';
  const match = normalized.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([0-9.]+))?\)/);
  if (!match) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const [, r, g, b, a] = match;
  return {
    r: Number.parseInt(r, 10),
    g: Number.parseInt(g, 10),
    b: Number.parseInt(b, 10),
    a: a !== undefined ? Number.parseFloat(a) : 1,
  };
}

function fromChannels({ r, g, b, a }: { r: number; g: number; b: number; a: number }): string {
  const clamped = {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
    a: clamp(a, 0, 1),
  };
  const raw =
    clamped.a >= 1
      ? `rgb(${clamped.r}, ${clamped.g}, ${clamped.b})`
      : `rgba(${clamped.r}, ${clamped.g}, ${clamped.b}, ${Math.round(clamped.a * 100) / 100})`;
  return normalizeChartSeriesColor(raw) ?? raw;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
