import { create } from 'zustand';

import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

interface OpenedChannelFileBase {
  path: string;
  status: 'loading' | 'ready';
}

export interface OpenedChannelFileLoading extends OpenedChannelFileBase {
  status: 'loading';
}

export interface OpenedChannelFileReady extends OpenedChannelFileBase {
  status: 'ready';
  file: ChannelFilePreviewPrimitive;
}

export type OpenedChannelFile = OpenedChannelFileLoading | OpenedChannelFileReady;

interface ChannelFilesState {
  files: OpenedChannelFile[];
  actions: {
    startFileOpen: (path: string) => void;
    addFile: (file: ChannelFilePreviewPrimitive) => void;
    markFileOpenFailed: (path: string) => void;
    removeFile: (path: string) => void;
    clearFiles: () => void;
  };
}

const useChannelFilesStore = create<ChannelFilesState>()((set) => ({
  files: [],
  actions: {
    startFileOpen: (path: string) =>
      set((state) => {
        const remaining = state.files.filter((file) => file.path !== path);
        const entry: OpenedChannelFileLoading = { path, status: 'loading' };
        return { files: [entry, ...remaining] };
      }),
    addFile: (file: ChannelFilePreviewPrimitive) =>
      set((state) => {
        const remaining = state.files.filter((entry) => entry.path !== file.path);
        const entry: OpenedChannelFileReady = { path: file.path, status: 'ready', file };
        return { files: [entry, ...remaining] };
      }),
    markFileOpenFailed: (path: string) =>
      set((state) => ({
        files: state.files.filter((file) => file.path !== path),
      })),
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
