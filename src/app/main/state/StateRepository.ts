import type { OpenedFile } from '@shared/ipc/IPCContracts';

export interface StateRepository {
  setLastOpenedFilePath(filePath: string): Promise<void>;
  clearLastOpenedFilePath(): Promise<void>;
  getLastOpenedFile(): Promise<OpenedFile | null>;
  getLastOpenedFiles(): Promise<OpenedFile[] | null>;
  onLastOpenedFilePathChange(cb: (newPaths: string[] | undefined) => void): () => void;
}
