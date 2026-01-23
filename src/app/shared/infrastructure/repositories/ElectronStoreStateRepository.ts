import { type Schema } from 'electron-store';

import {
  CachedChannelFileState,
  StateRepository,
} from '@shared/domain/repositories/StateRepository';

import { BaseElectronStore } from './BaseElectronStore';

type StateStore = {
  cachedChannelFiles?: CachedChannelFileState[];
};

const schema: Schema<StateStore> = {
  cachedChannelFiles: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        cacheDir: { type: 'string' },
      },
      required: ['path', 'cacheDir'],
    },
    default: [],
  },
};

export class ElectronStoreStateRepository
  extends BaseElectronStore<StateStore>
  implements StateRepository
{
  constructor() {
    super('state', schema);
  }

  public getCachedChannelFile(path: string): CachedChannelFileState | null {
    const entries = this.readCachedChannelFiles();
    return entries.find((entry) => entry.path === path) ?? null;
  }

  public setCachedChannelFile(entry: CachedChannelFileState): void {
    const entries = this.readCachedChannelFiles().filter((item) => item.path !== entry.path);
    entries.push(entry);
    this.store.set('cachedChannelFiles', entries);
  }

  public removeCachedChannelFile(path: string): void {
    const entries = this.readCachedChannelFiles().filter((item) => item.path !== path);
    this.store.set('cachedChannelFiles', entries);
  }

  public listCachedChannelFiles(): CachedChannelFileState[] {
    return this.readCachedChannelFiles();
  }

  private readCachedChannelFiles(): CachedChannelFileState[] {
    const raw = this.store.get('cachedChannelFiles');
    return normalizeCachedChannelFiles(raw);
  }
}

function normalizeCachedChannelFiles(raw: unknown): CachedChannelFileState[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter(isCachedChannelFileState);
}

function isCachedChannelFileState(value: unknown): value is CachedChannelFileState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.path === 'string' && typeof record.cacheDir === 'string';
}
