import { ChannelFileContentSerieDescriptorPrimitive } from '@shared/domain/primitives/ChannelFileContentSerieDescriptorPrimitive';
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

export class ChannelFileContentSerie {
  private constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly unit: string,
    public readonly values: number[],
  ) {}

  public static fromPrimitives(
    primitives: ChannelFileContentSeriePrimitive,
  ): ChannelFileContentSerie {
    return new ChannelFileContentSerie(
      primitives.id,
      primitives.label,
      primitives.unit,
      primitives.values,
    );
  }

  public toPrimitives(): ChannelFileContentSeriePrimitive {
    return {
      id: this.id,
      label: this.label,
      unit: this.unit,
      values: this.values,
    };
  }

  public toDescriptorPrimitives(): ChannelFileContentSerieDescriptorPrimitive {
    return {
      id: this.id,
      label: this.label,
      unit: this.unit,
    };
  }
}
