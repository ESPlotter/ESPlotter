import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';
import { ChannelFileContent } from '../vos/ChannelFileContent';

export class ChannelFile {
  private constructor(
    public path: string,
    public content: ChannelFileContent,
  ) {}

  public toPrimitives(): ChannelFilePrimitive {
    return {
      path: this.path,
      content: this.content.toPrimitives(),
    };
  }
}
