export interface CachedChannelFileState {
  path: string;
  cacheDir: string;
}

export interface StateRepository {
  getCachedChannelFile: (path: string) => CachedChannelFileState | null;
  setCachedChannelFile: (entry: CachedChannelFileState) => void;
  removeCachedChannelFile: (path: string) => void;
  listCachedChannelFiles: () => CachedChannelFileState[];
}
