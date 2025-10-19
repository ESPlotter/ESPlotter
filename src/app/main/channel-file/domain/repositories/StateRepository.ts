export interface StateRepository {
  saveOpenedFilePaths(filePath: string[]): Promise<void>;
  getLastOpenedChannelFilePath(): Promise<string | null>;
  getOpenedFilePaths(): Promise<string[]>;
  onLastOpenedChannelFilePathChange(cb: () => void): () => void;
}
