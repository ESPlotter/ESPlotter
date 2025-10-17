export interface StateRepository {
  saveOpenedFilePaths(filePath: string[]): Promise<void>;
  getLastOpenedFilePath(): Promise<string | null>;
  getOpenedFilePaths(): Promise<string[]>;
  onLastOpenedFilePathChange(cb: () => void): () => void;
}
