import { create } from 'zustand';

interface DataTableFormatState {
  decimals: number;
  fixed: boolean;
  actions: {
    setFormat: (decimals: number, fixed: boolean) => void;
    updateFormat: (decimals: number, fixed: boolean) => Promise<void>;
  };
}

const DEFAULT_DECIMALS = 6;
const DEFAULT_FIXED = true;

const useDataTableFormatStore = create<DataTableFormatState>()((set) => ({
  decimals: DEFAULT_DECIMALS,
  fixed: DEFAULT_FIXED,
  actions: {
    setFormat: (decimals: number, fixed: boolean) =>
      set(() => ({
        decimals,
        fixed,
      })),
    updateFormat: async (decimals: number, fixed: boolean) => {
      set({ decimals, fixed });
      await window.userPreferences.updateDataTableFormat(decimals, fixed);
    },
  },
}));

export function useDataTableFormat(): { decimals: number; fixed: boolean } {
  const decimals = useDataTableFormatStore((state) => state.decimals);
  const fixed = useDataTableFormatStore((state) => state.fixed);
  return { decimals, fixed };
}

export function useDataTableFormatActions() {
  return useDataTableFormatStore((state) => state.actions);
}
