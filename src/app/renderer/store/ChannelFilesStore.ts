import { create } from 'zustand';

import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

interface ChannelFilesState {
  files: ChannelFilePrimitive[];
  actions: {
    addFile: (file: ChannelFilePrimitive) => void;
    removeFile: (path: string) => void;
    clearFiles: () => void;
  };
}

const useChannelFilesStore = create<ChannelFilesState>()((set) => ({
  files: [],
  actions: {
    addFile: (file: ChannelFilePrimitive) =>
      set((state) => {
        const remaining = state.files.filter((f) => f.path !== file.path);
        return { files: [file, ...remaining] };
      }),
    removeFile: (path: string) =>
      set((state) => ({
        files: state.files.filter((f) => f.path !== path),
      })),
    clearFiles: () => set({ files: [] }),
  },
}));

export { useChannelFilesStore };
export const useChannelFiles = () => useChannelFilesStore((state) => state.files);
export const useChannelFilesActions = () => useChannelFilesStore((state) => state.actions);
