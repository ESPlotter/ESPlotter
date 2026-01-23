import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';
import { ChannelFileSeriesPrimitive } from '@shared/domain/primitives/ChannelFileSeriesPrimitive';

export interface ChannelFileRepository {
  readPreview: (path: string) => Promise<ChannelFilePreviewPrimitive | null>;
  readSeries: (path: string, channelId: string) => Promise<ChannelFileSeriesPrimitive>;
  prepareCache: (path: string) => Promise<string>;
  writeFromChannelFile: (
    cacheDir: string,
    channelFile: ChannelFile,
  ) => Promise<ChannelFilePreviewPrimitive>;
  removeCache: (path: string) => Promise<void>;
}
