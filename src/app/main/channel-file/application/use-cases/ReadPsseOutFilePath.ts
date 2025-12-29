import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

import { PsseOutFileService } from '../../domain/services/PsseOutFileService';

export class ReadPsseOutFilePath {
  constructor(private readonly fileService: PsseOutFileService) {}

  async run(path: string): Promise<ChannelFilePrimitive> {
    const channelFile = await this.fileService.transformToChannelFile(path);
    return channelFile.toPrimitives();
  }
}
