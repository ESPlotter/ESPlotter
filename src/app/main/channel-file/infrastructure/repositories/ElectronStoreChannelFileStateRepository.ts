import { type Schema } from 'electron-store';

import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { ChannelFile } from '../../domain/entities/ChannelFile';
import { ChannelFileStateRepository } from '../../domain/repositories/ChannelFileStateRepository';
import { ChannelFileService } from '../../domain/services/ChannelFileService';

type AppState = {
  openedFilePath?: string[];
};

const schema: Schema<AppState> = {
  openedFilePath: {
    type: 'array',
    items: { type: 'string' },
  },
};

export class ElectronStoreChannelFileStateRepository
  extends BaseElectronStore<AppState>
  implements ChannelFileStateRepository
{
  constructor(private readonly fileService: ChannelFileService) {
    super('state', schema);
  }

  public async saveOpenedChannelFiles(files: ChannelFile[]): Promise<void> {
    const paths = files.map((file) => file.path);
    this.stateStore.set('openedFilePath', paths);
  }

  public async getLastOpenedChannelFile(): Promise<ChannelFile | null> {
    const paths = this.stateStore.get('openedFilePath') ?? [];
    const lastPath = paths[0];
    if (!lastPath) {
      return null;
    }

    try {
      return await this.fileService.readChannelFile(lastPath);
    } catch {
      // Remove invalid path
      const updatedPaths = paths.filter((p) => p !== lastPath);
      this.stateStore.set('openedFilePath', updatedPaths);
      return null;
    }
  }

  public async getOpenedChannelFiles(): Promise<ChannelFile[]> {
    const paths = this.stateStore.get('openedFilePath') ?? [];
    const validFiles: ChannelFile[] = [];

    for (const path of paths) {
      try {
        const file = await this.fileService.readChannelFile(path);
        validFiles.push(file);
      } catch {
        // Remove invalid path from store
        const updatedPaths = paths.filter((p) => p !== path);
        this.stateStore.set('openedFilePath', updatedPaths);
      }
    }

    return validFiles;
  }

  public onLastOpenedChannelFileChange(cb: (file: ChannelFile | null) => void): () => void {
    return this.stateStore.onDidChange('openedFilePath', async (paths) => {
      if (!paths) {
        cb(null);
        return;
      }

      const [first] = paths;
      if (!first) {
        cb(null);
        return;
      }

      try {
        const file = await this.fileService.readChannelFile(first);
        cb(file);
      } catch {
        // Remove invalid path
        const updatedPaths = paths.filter((p) => p !== first);
        this.stateStore.set('openedFilePath', updatedPaths);
        cb(null);
      }
    });
  }
}
