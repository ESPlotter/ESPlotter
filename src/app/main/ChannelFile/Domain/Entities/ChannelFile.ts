import { ChannelFilePrimitive } from '../../../../shared/Domain/Primitives/ChannelFilePrimitive';
import { ChannelFileContent } from '../VOs/ChannelFileContent';

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
