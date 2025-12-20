import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

import { ChannelFileService } from '../../domain/services/ChannelFileService';

export class OpenChannelFile {
  constructor(private readonly fileService: ChannelFileService) {}

  async run(path: string): Promise<ChannelFilePrimitive> {
    const channelFile = await this.fileService.readChannelFile(path);
    return channelFile.toPrimitives();
  }
}
