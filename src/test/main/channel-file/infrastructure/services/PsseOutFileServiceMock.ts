import { vi } from 'vitest';

import type { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import type { PsseOutFileService } from '@main/channel-file/domain/services/PsseOutFileService';

export class PsseOutFileServiceMock implements PsseOutFileService {
  public readonly transformToChannelFileMock = vi.fn<(path: string) => Promise<ChannelFile>>();

  async transformToChannelFile(path: string): Promise<ChannelFile> {
    return this.transformToChannelFileMock(path);
  }
}
