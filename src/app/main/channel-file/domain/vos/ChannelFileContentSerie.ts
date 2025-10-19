import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

export class ChannelFileContentSerie {
  private constructor(
    public id: string,
    public label: string,
    public unit: string,
    public values: number[],
  ) {}

  public toPrimitives(): ChannelFileContentSeriePrimitive {
    return {
      id: this.id,
      label: this.label,
      unit: this.unit,
      values: this.values,
    };
  }
}
