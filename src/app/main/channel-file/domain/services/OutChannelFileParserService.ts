import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

export interface OutChannelFileParserService {
  parse: (path: string, cacheDir: string) => Promise<ChannelFilePreviewPrimitive>;
}
