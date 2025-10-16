import { app } from 'electron';
import { type Schema } from 'electron-store';
import { readFileUtf8 } from '@main/files/fileService';
import { isAllowedFileStructure, type AllowedFileStructure } from '@shared/AllowedFileStructure';
import type { OpenedFile } from '@shared/ipc/IPCContracts';
import { StateRepository } from './StateRepository';
import { BaseElectronStore } from './BaseElectronStore';

type AppState = {
  lastOpenedFilePath?: string[];
};

const schema: Schema<AppState> = {
  lastOpenedFilePath: {
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

  public async setLastOpenedFilePath(filePath: string): Promise<void> {
    const current = this.stateStore.get('lastOpenedFilePath') || [];

    const updated = [filePath, ...current.filter((f) => f !== filePath)];

    this.stateStore.set('lastOpenedFilePath', updated);

    try {
      app.addRecentDocument(filePath);
    } catch {
      // noop if platform unsupported
    }
  }

  public async clearLastOpenedFilePath(): Promise<void> {
    try {
      this.stateStore.delete('lastOpenedFilePath');
    } catch {}
  }

  public async getLastOpenedFile(): Promise<OpenedFile | null> {
    const paths = this.stateStore.get('lastOpenedFilePath') ?? null;
    const path = paths?.[0];
    if (!path) return null;

    try {
      const content = await readFileUtf8(path);
      const data: unknown = JSON.parse(content);
      if (!isAllowedFileStructure(data)) {
        await this.clearLastOpenedFilePath();
        return null;
      }
      return { path, data: data as AllowedFileStructure };
    } catch {
      // If corrupted JSON or unreadable, clear stored path per decision
      await this.clearLastOpenedFilePath();
      return null;
    }
  }

  public async getLastOpenedFiles(): Promise<OpenedFile[] | null> {
    const paths = this.stateStore.get('lastOpenedFilePath') ?? null;

    if (!paths) return null;

    const openedFiles: OpenedFile[] = [];

    for (const path of paths) {
      try {
        const content = await readFileUtf8(path);
        const data: unknown = JSON.parse(content);

        if (!isAllowedFileStructure(data)) {
          const filteredPaths = paths.filter((p) => p !== path);
          await this.stateStore.set('lastOpenedFilePath', filteredPaths);
          continue;
        }

        openedFiles.push({ path, data: data as AllowedFileStructure });
      } catch {
        // Si JSON corrupto o archivo no accesible, eliminar del store
        const filteredPaths = paths.filter((p) => p !== path);
        await this.stateStore.set('lastOpenedFilePath', filteredPaths);
        continue;
      }
    }
    return openedFiles.length > 0 ? openedFiles : null;
  }

  public onLastOpenedFilePathChange(cb: (newPaths: string[] | undefined) => void): () => void {
    return this.onStateChange('lastOpenedFilePath', cb);
  }

  private onStateChange<K extends keyof AppState>(
    key: K,
    cb: (newValue: AppState[K] | undefined) => void,
  ): () => void {
    return this.stateStore.onDidChange(key, (newValue) => cb(newValue));
  }
}
