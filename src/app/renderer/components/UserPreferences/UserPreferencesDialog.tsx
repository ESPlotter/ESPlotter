import { PlusIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';

import {
  useUserPreferencesActions,
  useUserPreferencesChartSeriesPalette,
  useUserPreferencesDialogState,
  useUserPreferencesValidationErrors,
} from '@renderer/store/UserPreferencesStore';
import { Button } from '@shadcn/components/ui/button';
import { Input } from '@shadcn/components/ui/input';
import { Separator } from '@shadcn/components/ui/separator';
import { normalizeChartSeriesColor } from '@shared/domain/validators/normalizeChartSeriesColor';

export function UserPreferencesDialog(): JSX.Element | null {
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftColor, setDraftColor] = useState<string>('');

  const invalidIndices = useMemo(() => {
    const invalid = new Set<number>();
    palette.forEach((color, index) => {
      if (!normalizeChartSeriesColor(color)) {
        invalid.add(index);
      }
    });
    return invalid;
  }, [palette]);

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

  if (!isDialogOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4 shadow-sm lg:px-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preferences
          </p>
          <h1 className="text-2xl font-semibold">User Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Organize all application settings from a single, full-width workspace.
          </p>
        </div>
        <div className="flex gap-2">
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
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden px-6 py-6 lg:grid-cols-[280px_1fr] lg:px-10">
        <nav className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sections
          </p>
          <Button variant="secondary" className="justify-start" disabled>
            Appearance (actual)
          </Button>
          <Button variant="ghost" className="justify-start" disabled>
            Data & Storage (pronto)
          </Button>
          <Button variant="ghost" className="justify-start" disabled>
            Shortcuts (pronto)
          </Button>
          <Button variant="ghost" className="justify-start" disabled>
            Notifications (pronto)
          </Button>
        </nav>

        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          <section className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Chart Series Palette
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reorder, edit or add colours. Click a swatch to edit.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => resetToDefaults()}>
                  <RotateCcwIcon className="mr-2 size-4" /> Reset to defaults
                </Button>
                <Button onClick={() => addColor()} variant="outline" size="sm">
                  <PlusIcon className="mr-2 size-4" /> Add colour
                </Button>
              </div>
            </div>
            <Separator />

            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Estos colores se usan en todas las series de tus gráficas, en orden. Ajusta cada
                tono para mantener contraste y consistencia visual.
              </p>

              {palette.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  The palette is empty. Random colors will be generated when charts need them.
                </p>
              )}
                <CompactPalette
                  palette={palette}
                  invalidIndices={invalidIndices}
                  editingIndex={editingIndex}
                  draftColor={draftColor}
                  onSelect={(index) => {
                    setEditingIndex(index);
                    setDraftColor(palette[index] ?? '');
                  }}
                  onChangeDraft={(value) => setDraftColor(value)}
                  onSave={(index) => {
                    replaceColor(index, draftColor);
                    setEditingIndex(null);
                  }}
                  onCancel={() => setEditingIndex(null)}
                  onReorder={(source, target) => reorder(source, target)}
                  onRemove={(index) => removeColor(index)}
                />
              </div>
          </section>

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

          <section className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/10 p-5 text-sm text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">More preferences coming</p>
            <p>Layout here is ready for additional sections (data, shortcuts, notifications).</p>
          </section>
        </div>
      </div>

    </div>
  );
}

function CompactPalette({
  palette,
  invalidIndices,
  editingIndex,
  draftColor,
  onSelect,
  onChangeDraft,
  onSave,
  onCancel,
  onReorder,
  onRemove,
}: {
  palette: string[];
  invalidIndices: Set<number>;
  editingIndex: number | null;
  draftColor: string;
  onSelect: (index: number) => void;
  onChangeDraft: (value: string) => void;
  onSave: (index: number) => void;
  onCancel: () => void;
  onReorder: (sourceIndex: number, targetIndex: number) => void;
  onRemove: (index: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    onReorder(dragIndex, targetIndex);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {palette.map((color, index) => {
        const isDragSource = dragIndex === index;
        const isDragTarget = dragOverIndex === index && !isDragSource;

        return (
        <div
          key={`${color}-${index}`}
          className={`group rounded-md border border-border/70 bg-background p-3 shadow-sm transition ${
            isDragSource ? 'opacity-60 ring-2 ring-primary/40' : ''
          } ${isDragTarget ? 'ring-2 ring-dashed ring-primary/50' : ''}`}
          draggable
          onDragStart={() => {
            setDragIndex(index);
            setDragOverIndex(index);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (dragOverIndex !== index) {
              setDragOverIndex(index);
            }
          }}
          onDragLeave={() => {
            if (dragOverIndex === index) {
              setDragOverIndex(null);
            }
          }}
          onDrop={() => handleDrop(index)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 text-center text-xs font-semibold text-muted-foreground bg-muted/40 rounded border">
              {index + 1}
            </div>
            <button
              type="button"
              aria-label={`Edit colour ${index + 1}`}
              onClick={() => onSelect(index)}
              className={`flex h-12 flex-1 items-center justify-start gap-3 rounded-md border px-3 transition focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${invalidIndices.has(index) ? 'border-destructive' : 'border-border'}`}
              style={{ backgroundColor: normalizeChartSeriesColor(color) ?? color }}
            >
              <span className="text-xs font-medium text-muted-foreground bg-background/70 rounded px-2 py-1">
                {color}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded p-2 hover:bg-muted"
              aria-label="Remove colour"
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>

          {editingIndex === index && (
            <div className="mt-3 space-y-2 rounded-md border border-border/70 bg-muted/10 p-3 shadow-inner">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick colour"
                  className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
                  value={toHexOrFallback(draftColor || color)}
                  onChange={(event) => onChangeDraft(hexToRgb(event.target.value))}
                />
                <Input
                  value={draftColor}
                  onChange={(event) => onChangeDraft(event.target.value)}
                  placeholder={normalizeChartSeriesColor(color) ?? 'rgb(59, 130, 246)'}
                  aria-label="Colour value"
                  className="flex-1 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  Close
                </Button>
                <Button size="sm" onClick={() => onSave(index)}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

function toHexOrFallback(color: string): string {
  const element = document.createElement('div');
  element.style.color = color;
  document.body.appendChild(element);
  const computed = getComputedStyle(element).color;
  document.body.removeChild(element);

  const match = computed.match(/rgb\((\d+), (\d+), (\d+)\)/);
  if (!match) {
    return '#000000';
  }
  const [, r, g, b] = match.map(Number);
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): string {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const [r, g, b] = normalized.split('').map((ch) => ch + ch);
    return `rgb(${Number.parseInt(r, 16)}, ${Number.parseInt(g, 16)}, ${Number.parseInt(b, 16)})`;
  }
  if (normalized.length === 6) {
    const r = normalized.slice(0, 2);
    const g = normalized.slice(2, 4);
    const b = normalized.slice(4, 6);
    return `rgb(${Number.parseInt(r, 16)}, ${Number.parseInt(g, 16)}, ${Number.parseInt(b, 16)})`;
  }
  return normalizeChartSeriesColor(hex) ?? hex;
}
