import { create } from 'zustand';

import { generateRandomHexColor } from '@renderer/components/Chart/Chart';
import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';

interface UserPreferencesState {
  chartSeriesPalette: string[];
  actions: {
    setChartSeriesPalette: (palette: string[]) => void;
    replaceColor: (index: number, value: string) => void;
    addColor: (color?: string) => void;
    removeColor: (index: number) => void;
    reorder: (sourceIndex: number, targetIndex: number) => void;
    resetToDefaults: () => void;
  };
}

const useUserPreferencesStore = create<UserPreferencesState>()((set) => ({
  chartSeriesPalette: [...DEFAULT_CHART_SERIES_PALETTE],
  actions: {
    setChartSeriesPalette: (palette: string[]) =>
      set(() => ({
        chartSeriesPalette: [...palette],
      })),
    replaceColor: (index: number, value: string) =>
      set((state) => {
        if (index < 0 || index >= state.chartSeriesPalette.length) {
          return state;
        }
        const nextPalette = [...state.chartSeriesPalette];
        nextPalette[index] = value.trim();
        return {
          chartSeriesPalette: nextPalette,
        };
      }),
    addColor: (color?: string) =>
      set((state) => {
        const nextPalette = [
          ...state.chartSeriesPalette,
          (color ?? generateRandomHexColor()).trim(),
        ];
        return {
          chartSeriesPalette: nextPalette,
        };
      }),
    removeColor: async (index: number) => {
      let nextPalette: string[] = [];
    
      set((state) => {
        if (index < 0 || index >= state.chartSeriesPalette.length) {
          return state;
        }
      
        nextPalette = state.chartSeriesPalette.filter((_, idx) => idx !== index);
      
        return { chartSeriesPalette: nextPalette };
      });
    
      await window.userPreferences.updateChartSeriesPalette(nextPalette);
    },

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
        };
      }),
    resetToDefaults: () =>
      set(() => ({
        chartSeriesPalette: [...DEFAULT_CHART_SERIES_PALETTE],
      })),
  },
}));

export function useUserPreferencesChartSeriesPalette(): string[] {
  return useUserPreferencesStore((state) => state.chartSeriesPalette);
}

export function useUserPreferencesActions() {
  return useUserPreferencesStore((state) => state.actions);
}
