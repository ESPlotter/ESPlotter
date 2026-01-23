import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

import { ChannelFileContent } from '../vos/ChannelFileContent';

export class ChannelFile {
  private constructor(
    public readonly path: string,
    public readonly content: ChannelFileContent,
  ) {}

  public static fromPrimitives(primitives: ChannelFilePrimitive): ChannelFile {
    return new ChannelFile(primitives.path, ChannelFileContent.fromPrimitives(primitives.content));
  }

  public toPrimitives(): ChannelFilePrimitive {
    return {
      path: this.path,
      content: this.content.toPrimitives(),
    };
  }

  public toPreviewPrimitives(): ChannelFilePreviewPrimitive {
    return {
      path: this.path,
      content: this.content.toPreviewPrimitives(),
    };
  }
}
