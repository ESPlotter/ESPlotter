import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';

import { ChannelFileContentMetadata } from './ChannelFileContentMetadata';
import { ChannelFileContentSerie } from './ChannelFileContentSerie';

export class ChannelFileContent {
  private constructor(
    public schemaVersion: number,
    public metadata: ChannelFileContentMetadata,
    public x: ChannelFileContentSerie,
    public series: ChannelFileContentSerie[],
  ) {}

  public toPrimitives(): ChannelFileContentPrimitive {
    return {
      schemaVersion: this.schemaVersion,
      metadata: this.metadata.toPrimitives(),
      x: this.x.toPrimitives(),
      series: this.series.map((serie) => serie.toPrimitives()),
    };
  }
}
