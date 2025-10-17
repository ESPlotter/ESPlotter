import fs from 'node:fs/promises';

import { FileService } from '@main/channel-file/domain/services/FileService';

export class NodeFileService implements FileService {
  public async readFileUtf8(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }
}
