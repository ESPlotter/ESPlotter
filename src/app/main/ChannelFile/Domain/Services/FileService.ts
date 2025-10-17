export interface FileService {
  readFileUtf8(path: string): Promise<string>;
}
