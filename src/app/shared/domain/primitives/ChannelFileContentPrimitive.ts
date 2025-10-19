import { ChannelFileContentMetadataPrimitive } from './ChannelFileContentMetadataPrimitive';
import { ChannelFileContentSeriePrimitive } from './ChannelFileContentSeriePrimitive';

export interface ChannelFileContentPrimitive {
  schemaVersion: number;
  metadata: ChannelFileContentMetadataPrimitive;
  x: ChannelFileContentSeriePrimitive;
  series: ChannelFileContentSeriePrimitive[];
}
