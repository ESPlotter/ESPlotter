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
    const path = this.stateStore.get('openedFilePath')?.[0];
    if (!path) {
      return null;
    }
    return this.fileService.readChannelFile(path);
  }

  public async getOpenedChannelFiles(): Promise<ChannelFile[]> {
    const paths = this.stateStore.get('openedFilePath') ?? [];
    const results = await Promise.all(paths.map((path) => this.fileService.readChannelFile(path)));

    return results;
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

      const file = await this.fileService.readChannelFile(first);
      cb(file);
    });
  }
}
