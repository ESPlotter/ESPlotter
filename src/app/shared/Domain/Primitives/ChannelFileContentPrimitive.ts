import { ChannelFileContentSeriePrimitive } from './ChannelFileContentSeriePrimitive';
import { ChannelFileContentMetadataPrimitive } from './ChannelFileContentMetadataPrimitive';

export interface ChannelFileContentPrimitive {
  schemaVersion: number;
  metadata: ChannelFileContentMetadataPrimitive;
  x: ChannelFileContentSeriePrimitive;
  series: ChannelFileContentSeriePrimitive[];
}
