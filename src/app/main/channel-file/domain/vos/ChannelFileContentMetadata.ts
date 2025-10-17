import { ChannelFileContentMetadataPrimitive } from '@shared/domain/primitives/ChannelFileContentMetadataPrimitive';

export class ChannelFileContentMetadata {
  private constructor(
    public timestamp: string,
    public SCR: number,
  ) {}

  public toPrimitives(): ChannelFileContentMetadataPrimitive {
    return {
      timestamp: this.timestamp,
      SCR: this.SCR,
    };
  }
}
