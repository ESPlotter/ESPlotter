import { ChannelFileContentMetadataPrimitive } from './ChannelFileContentMetadataPrimitive';
import { ChannelFileContentSerieDescriptorPrimitive } from './ChannelFileContentSerieDescriptorPrimitive';

export interface ChannelFileContentPreviewPrimitive {
  schemaVersion: number;
  metadata: ChannelFileContentMetadataPrimitive;
  x: ChannelFileContentSerieDescriptorPrimitive;
  series: ChannelFileContentSerieDescriptorPrimitive[];
}
