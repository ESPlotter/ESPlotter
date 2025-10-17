import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';

export interface ChannelFilePrimitive {
  path: string;
  content: ChannelFileContentPrimitive;
}
