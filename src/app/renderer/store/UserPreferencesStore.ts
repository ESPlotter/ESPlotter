import { create } from 'zustand';

import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';
import { normalizeChartSeriesColor } from '@shared/domain/validators/normalizeChartSeriesColor';

interface UserPreferencesState {
  chartSeriesPalette: string[];
  isDialogOpen: boolean;
  validationErrors: string[];
  actions: {
    setChartSeriesPalette: (palette: string[]) => void;
    openDialog: () => void;
    closeDialog: () => void;
    replaceColor: (index: number, value: string) => void;
    addColor: (color?: string) => void;
    removeColor: (index: number) => void;
    reorder: (sourceIndex: number, targetIndex: number) => void;
    resetToDefaults: () => void;
  };
}

const useUserPreferencesStore = create<UserPreferencesState>()((set) => ({
  chartSeriesPalette: [...DEFAULT_CHART_SERIES_PALETTE],
  isDialogOpen: false,
  validationErrors: [],
  actions: {
    setChartSeriesPalette: (palette: string[]) =>
      set(() => ({
        chartSeriesPalette: [...palette],
        validationErrors: validatePalette(palette),
      })),
    openDialog: () =>
      set((state) => {
        if (state.isDialogOpen) {
          return state;
        }
        return { isDialogOpen: true };
      }),
    closeDialog: () =>
      set((state) => {
        if (!state.isDialogOpen) {
          return state;
        }
        return { isDialogOpen: false };
      }),
    replaceColor: (index: number, value: string) =>
      set((state) => {
        if (index < 0 || index >= state.chartSeriesPalette.length) {
          return state;
        }
        const nextPalette = [...state.chartSeriesPalette];
        nextPalette[index] = value.trim();
        return {
          chartSeriesPalette: nextPalette,
          validationErrors: validatePalette(nextPalette),
        };
      }),
    addColor: (color?: string) =>
      set((state) => {
        const nextPalette = [...state.chartSeriesPalette, (color ?? generateRandomColor()).trim()];
        return {
          chartSeriesPalette: nextPalette,
          validationErrors: validatePalette(nextPalette),
        };
      }),
    removeColor: (index: number) =>
      set((state) => {
        if (index < 0 || index >= state.chartSeriesPalette.length) {
          return state;
        }
        const nextPalette = state.chartSeriesPalette.filter((_, idx) => idx !== index);
        return {
          chartSeriesPalette: nextPalette,
          validationErrors: validatePalette(nextPalette),
        };
      }),
    reorder: (sourceIndex: number, targetIndex: number) =>
      set((state) => {
        if (
          sourceIndex < 0 ||
          sourceIndex >= state.chartSeriesPalette.length ||
          targetIndex < 0 ||
          targetIndex >= state.chartSeriesPalette.length ||
          sourceIndex === targetIndex
        ) {
          return state;
        }
        const nextPalette = [...state.chartSeriesPalette];
        const [moved] = nextPalette.splice(sourceIndex, 1);
        nextPalette.splice(targetIndex, 0, moved);
        return {
          chartSeriesPalette: nextPalette,
          validationErrors: validatePalette(nextPalette),
        };
      }),
    resetToDefaults: () =>
      set(() => ({
        chartSeriesPalette: [...DEFAULT_CHART_SERIES_PALETTE],
        validationErrors: [],
      })),
  },
}));

function validatePalette(palette: string[]): string[] {
  const errors: string[] = [];
  palette.forEach((value, index) => {
    if (!normalizeChartSeriesColor(value)) {
      errors.push(`Color ${index + 1} must be in rgb(...) or rgba(...) format.`);
    }
  });
  return errors;
}

function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

export function useUserPreferencesChartSeriesPalette(): string[] {
  return useUserPreferencesStore((state) => state.chartSeriesPalette);
}

export function useUserPreferencesDialogState(): boolean {
  return useUserPreferencesStore((state) => state.isDialogOpen);
}

export function useUserPreferencesValidationErrors(): string[] {
  return useUserPreferencesStore((state) => state.validationErrors);
}

export function useUserPreferencesActions() {
  return useUserPreferencesStore((state) => state.actions);
}
