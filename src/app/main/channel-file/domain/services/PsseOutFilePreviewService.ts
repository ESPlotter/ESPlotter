import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

export interface PsseOutFilePreviewService {
  parsePreview: (path: string, cacheDir: string) => Promise<ChannelFilePreviewPrimitive>;
}
