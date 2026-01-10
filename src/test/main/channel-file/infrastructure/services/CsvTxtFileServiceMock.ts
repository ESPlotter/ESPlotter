import { vi } from 'vitest';

import type { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import type { CsvTxtFileService } from '@main/channel-file/domain/services/CsvTxtFileService';

export class CsvTxtFileServiceMock implements CsvTxtFileService {
  public readonly transformToChannelFileMock = vi.fn<(path: string) => Promise<ChannelFile>>();

  async transformToChannelFile(path: string): Promise<ChannelFile> {
    return this.transformToChannelFileMock(path);
  }
}
