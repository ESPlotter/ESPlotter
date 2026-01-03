import { create } from 'zustand';

import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';
import { generateRandomHexColor } from '@shared/utils/generateRandomHexColor';

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
    replaceColor: async (index: number, value: string) => {
      let nextPalette: string[] = [];

      set((state) => {
        if (index < 0 || index >= state.chartSeriesPalette.length) {
          return state;
        }
        nextPalette = [...state.chartSeriesPalette];
        nextPalette[index] = value.trim();
        return {
          chartSeriesPalette: nextPalette,
        };
      });

      await window.userPreferences.updateChartSeriesPalette(nextPalette);
    },
    addColor: async (color?: string) => {
      let nextPalette: string[] = [];

      set((state) => {
        nextPalette = [...state.chartSeriesPalette, (color ?? generateRandomHexColor()).trim()];
        return {
          chartSeriesPalette: nextPalette,
        };
      });

      await window.userPreferences.updateChartSeriesPalette(nextPalette);
    },
    removeColor: async (index: number) => {
      const current = useUserPreferencesStore.getState().chartSeriesPalette;

      if (index < 0 || index >= current.length) {
        return; // ⬅️ no set, no persist
      }

      const nextPalette = current.filter((_, idx) => idx !== index);

      set({ chartSeriesPalette: nextPalette });

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
