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
  timeOffset: number;
  channelGains: Record<string, number>;
  channelOffsets: Record<string, number>;
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
    setFileTimeOffset: (path: string, timeOffset: number) => void;
    setChannelGain: (path: string, channelId: string, gain: number) => void;
    setChannelOffset: (path: string, channelId: string, offset: number) => void;
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
        const channelGains = file.content.series.reduce<Record<string, number>>(
          (acc, channel) => {
            acc[channel.id] = 1;
            return acc;
          },
          {},
        );
        const channelOffsets = file.content.series.reduce<Record<string, number>>(
          (acc, channel) => {
            acc[channel.id] = 0;
            return acc;
          },
          {},
        );
        const entry: OpenedChannelFileReady = {
          path: file.path,
          status: 'ready',
          file,
          timeOffset: 0,
          channelGains,
          channelOffsets,
        };
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
    setFileTimeOffset: (path: string, timeOffset: number) =>
      set((state) => {
        const files = state.files.map((file) => {
          if (file.path === path && file.status === 'ready') {
            return { ...file, timeOffset };
          }
          return file;
        });
        return { files };
      }),
    setChannelGain: (path: string, channelId: string, gain: number) =>
      set((state) => {
        const files = state.files.map((file) => {
          if (file.path === path && file.status === 'ready') {
            return {
              ...file,
              channelGains: {
                ...file.channelGains,
                [channelId]: gain,
              },
            };
          }
          return file;
        });
        return { files };
      }),
    setChannelOffset: (path: string, channelId: string, offset: number) =>
      set((state) => {
        const files = state.files.map((file) => {
          if (file.path === path && file.status === 'ready') {
            return {
              ...file,
              channelOffsets: {
                ...file.channelOffsets,
                [channelId]: offset,
              },
            };
          }
          return file;
        });
        return { files };
      }),
  },
}));

export { useChannelFilesStore };
export const useChannelFiles = () => useChannelFilesStore((state) => state.files);
export const useChannelFilesActions = () => useChannelFilesStore((state) => state.actions);
