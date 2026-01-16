import { create } from 'zustand';

import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';
import { DEFAULT_DYNTOOLS_PATH } from '@shared/domain/constants/defaultDyntoolsPath';
import { DEFAULT_PYTHON_PATH } from '@shared/domain/constants/defaultPythonPath';
import { generateRandomHexColor } from '@shared/utils/generateRandomHexColor';

interface UserPreferencesState {
  chartSeriesPalette: string[];
  dyntoolsPath: string;
  pythonPath: string;
  actions: {
    setChartSeriesPalette: (palette: string[]) => void;
    setDyntoolsPath: (path: string) => void;
    updateDyntoolsPath: (path: string) => Promise<void>;
    setPythonPath: (path: string) => void;
    updatePythonPath: (path: string) => Promise<void>;
    replaceColor: (index: number, value: string) => void;
    addColor: (color?: string) => void;
    removeColor: (index: number) => void;
    reorder: (sourceIndex: number, targetIndex: number) => void;
    resetToDefaults: () => void;
  };
}

const useUserPreferencesStore = create<UserPreferencesState>()((set) => ({
  chartSeriesPalette: [...DEFAULT_CHART_SERIES_PALETTE],
  dyntoolsPath: DEFAULT_DYNTOOLS_PATH,
  pythonPath: DEFAULT_PYTHON_PATH,
  actions: {
    setChartSeriesPalette: (palette: string[]) =>
      set(() => ({
        chartSeriesPalette: [...palette],
      })),
    setDyntoolsPath: (path: string) =>
      set(() => ({
        dyntoolsPath: path,
      })),
    updateDyntoolsPath: async (path: string) => {
      const result = await window.userPreferences.updateDyntoolsPath(path.trim());
      set(() => ({ dyntoolsPath: result.general.paths.dyntoolsPath }));
    },
    setPythonPath: (path: string) =>
      set(() => ({
        pythonPath: path,
      })),
    updatePythonPath: async (path: string) => {
      const result = await window.userPreferences.updatePythonPath(path.trim());
      set(() => ({ pythonPath: result.general.paths.pythonPath }));
    },

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

export function useUserPreferencesDyntoolsPath(): string {
  return useUserPreferencesStore((state) => state.dyntoolsPath);
}

export function useUserPreferencesPythonPath(): string {
  return useUserPreferencesStore((state) => state.pythonPath);
}

export function useUserPreferencesActions() {
  return useUserPreferencesStore((state) => state.actions);
}
