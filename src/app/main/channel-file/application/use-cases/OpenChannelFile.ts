import { ChannelFileRepository } from '@main/channel-file/domain/repositories/ChannelFileRepository';
import { ChannelFileParserService } from '@main/channel-file/domain/services/ChannelFileParserService';
import { OutChannelFileParserService } from '@main/channel-file/domain/services/OutChannelFileParserService';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

export class OpenChannelFile {
  constructor(
    private readonly repository: ChannelFileRepository,
    private readonly jsonChannelFileParserService: ChannelFileParserService,
    private readonly csvChannelFileParserService: ChannelFileParserService,
    private readonly psseOutFilePreviewService: OutChannelFileParserService,
  ) {}

  async run(path: string): Promise<ChannelFilePreviewPrimitive> {
    const cachedPreview = await this.repository.readChannels(path);
    if (cachedPreview) {
      return cachedPreview;
    }

    const extension = path.toLowerCase().split('.').pop();
    const cacheDir = await this.repository.prepareCache(path);

    try {
      if (extension === 'out') {
        return await this.psseOutFilePreviewService.parse(path, cacheDir); // This parse also saves the data in the cache
      }

      if (extension === 'csv') {
        const channelFile = await this.csvChannelFileParserService.parse(path);
        return await this.repository.save(cacheDir, channelFile);
      }

      if (extension === 'txt') {
        const channelFile = await this.csvChannelFileParserService.parse(path);
        return await this.repository.save(cacheDir, channelFile);
      }

      if (extension === 'json') {
        const channelFile = await this.jsonChannelFileParserService.parse(path);
        return await this.repository.save(cacheDir, channelFile);
      }

      throw new Error('Unsupported file extension');
    } catch (error) {
      await this.repository.remove(path);
      throw error;
    }
  }
}
