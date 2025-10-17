import { FileService } from '@main/ChannelFile/Domain/Services/FileService';
import fs from 'node:fs/promises';

export class NodeFileService implements FileService {
  public async readFileUtf8(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }
}
