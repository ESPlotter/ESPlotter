import { ChannelFileContentPrimitive } from '@shared/Domain/Primitives/ChannelFileContentPrimitive';

export interface ChannelFilePrimitive {
  path: string;
  content: ChannelFileContentPrimitive;
}
