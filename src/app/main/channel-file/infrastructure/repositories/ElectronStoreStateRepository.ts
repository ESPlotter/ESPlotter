import { type Schema } from 'electron-store';

import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { StateRepository } from '../../domain/repositories/StateRepository';

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
  constructor() {
    super('state', schema);
  }

  public async saveOpenedFilePaths(filePaths: string[]): Promise<void> {
    this.stateStore.set('openedFilePath', filePaths);
  }

  public async getLastOpenedFilePath(): Promise<string | null> {
    const paths = this.stateStore.get('openedFilePath') ?? [];

    if (paths.length === 0) {
      return null;
    }

    return paths[0];
  }

  public async getOpenedFilePaths(): Promise<string[]> {
    return this.stateStore.get('openedFilePath') ?? [];
  }

  public onLastOpenedFilePathChange(cb: () => void): () => void {
    return this.stateStore.onDidChange('openedFilePath', () => {
      cb();
    });
  }
}
