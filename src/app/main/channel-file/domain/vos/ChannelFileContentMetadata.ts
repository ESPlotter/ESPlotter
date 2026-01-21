import { ChannelFileContentMetadataPrimitive } from '@shared/domain/primitives/ChannelFileContentMetadataPrimitive';

export class ChannelFileContentMetadata {
  private constructor(private readonly value: ChannelFileContentMetadataPrimitive) {}

  public static fromPrimitives(
    primitives: ChannelFileContentMetadataPrimitive,
  ): ChannelFileContentMetadata {
    return new ChannelFileContentMetadata({ ...primitives });
  }

  public toPrimitives(): ChannelFileContentMetadataPrimitive {
    return { ...this.value };
  }
}
