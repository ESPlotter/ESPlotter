import { ChannelFileRepository } from '@main/channel-file/domain/repositories/ChannelFileRepository';
import { ChannelFileParserService } from '@main/channel-file/domain/services/ChannelFileParserService';
import { PsseOutFilePreviewService } from '@main/channel-file/domain/services/PsseOutFilePreviewService';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

export class OpenChannelFile {
  constructor(
    private readonly repository: ChannelFileRepository,
    private readonly jsonChannelFileParserService: ChannelFileParserService,
    private readonly csvChannelFileParserService: ChannelFileParserService,
    private readonly psseOutFilePreviewService: PsseOutFilePreviewService,
  ) {}

  async run(path: string): Promise<ChannelFilePreviewPrimitive> {
    const cachedPreview = await this.repository.readPreview(path);
    if (cachedPreview) {
      return cachedPreview;
    }

    const extension = path.toLowerCase().split('.').pop();
    const cacheDir = await this.repository.prepareCache(path);

    try {
      if (extension === 'out') {
        return await this.psseOutFilePreviewService.parsePreview(path, cacheDir);
      }

      if (extension === 'csv' || extension === 'txt') {
        const channelFile = await this.csvChannelFileParserService.parse(path);
        return await this.repository.writeFromChannelFile(cacheDir, channelFile);
      }

      if (extension === 'json') {
        const channelFile = await this.jsonChannelFileParserService.parse(path);
        return await this.repository.writeFromChannelFile(cacheDir, channelFile);
      }

      throw new Error('Unsupported file extension');
    } catch (error) {
      await this.repository.removeCache(path);
      throw error;
    }
  }
}
