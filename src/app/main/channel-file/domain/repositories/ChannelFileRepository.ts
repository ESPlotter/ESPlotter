import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';
import { ChannelFileSeriesPrimitive } from '@shared/domain/primitives/ChannelFileSeriesPrimitive';

export interface ChannelFileRepository {
  readChannels: (path: string) => Promise<ChannelFilePreviewPrimitive | null>;
  readChannelSerie: (path: string, channelId: string) => Promise<ChannelFileSeriesPrimitive>;
  prepareCache: (path: string) => Promise<string>;
  save: (cacheDir: string, channelFile: ChannelFile) => Promise<ChannelFilePreviewPrimitive>;
  remove: (path: string) => Promise<void>;
}
