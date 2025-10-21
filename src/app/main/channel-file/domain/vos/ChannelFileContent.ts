import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';

import { ChannelFileContentMetadata } from './ChannelFileContentMetadata';
import { ChannelFileContentSerie } from './ChannelFileContentSerie';

export class ChannelFileContent {
  private constructor(
    public readonly schemaVersion: number,
    public readonly metadata: ChannelFileContentMetadata,
    public readonly x: ChannelFileContentSerie,
    public readonly series: ChannelFileContentSerie[],
  ) {}

  public static fromPrimitives(primitives: ChannelFileContentPrimitive): ChannelFileContent {
    return new ChannelFileContent(
      primitives.schemaVersion,
      ChannelFileContentMetadata.fromPrimitives(primitives.metadata),
      ChannelFileContentSerie.fromPrimitives(primitives.x),
      primitives.series.map((serie) => ChannelFileContentSerie.fromPrimitives(serie)),
    );
  }

  public toPrimitives(): ChannelFileContentPrimitive {
    return {
      schemaVersion: this.schemaVersion,
      metadata: this.metadata.toPrimitives(),
      x: this.x.toPrimitives(),
      series: this.series.map((serie) => serie.toPrimitives()),
    };
  }
}
