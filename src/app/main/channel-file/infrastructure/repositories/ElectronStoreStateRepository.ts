import { type Schema } from 'electron-store';

import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { ChannelFile } from '../../domain/entities/ChannelFile';
import { StateRepository } from '../../domain/repositories/StateRepository';
import { FileService } from '../../domain/services/FileService';

type AppState = {
  openedFilePath?: string[];
};

const schema: Schema<AppState> = {
  openedFilePath: {
    type: 'array',
    items: { type: 'string' },
  },
};

export class ElectronStoreStateRepository
  extends BaseElectronStore<AppState>
  implements StateRepository
{
  constructor(private readonly fileService: FileService) {
    super('state', schema);
  }

  public async saveOpenedChannelFiles(files: ChannelFile[]): Promise<void> {
    const paths = files.map((file) => file.path);
    this.store.set('openedFilePath', paths);
  }

  public async getLastOpenedChannelFile(): Promise<ChannelFile | null> {
    const path = this.store.get('openedFilePath')?.[0];
    if (!path) {
      return null;
    }
    return this.fileService.readChannelFile(path);
  }

  public async getOpenedChannelFiles(): Promise<ChannelFile[]> {
    const paths = this.store.get('openedFilePath') ?? [];
    const results = await Promise.all(paths.map((path) => this.fileService.readChannelFile(path)));

    return results;
  }

  public onLastOpenedChannelFileChange(cb: (file: ChannelFile | null) => void): () => void {
    return this.store.onDidChange('openedFilePath', async (paths) => {
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
