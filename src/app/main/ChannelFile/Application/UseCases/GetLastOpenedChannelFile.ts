import { ChannelFileContentPrimitive } from '@shared/Domain/Primitives/ChannelFileContentPrimitive';
import { ChannelFilePrimitive } from '@shared/Domain/Primitives/ChannelFilePrimitive';

export class GetLastOpenedChannelFile {
  constructor(
    private stateRepository: import('../../Domain/Repositories/StateRepository').StateRepository,
    private fileService: import('../../Domain/Services/FileService').FileService,
  ) {}

  async run(): Promise<ChannelFilePrimitive | null> {
    const lastOpenedFilePath = await this.stateRepository.getLastOpenedFilePath();

    if (!lastOpenedFilePath) {
      return null;
    }

    const fileContentText = await this.fileService.readFileUtf8(lastOpenedFilePath);
    const fileContent = JSON.parse(fileContentText) as ChannelFileContentPrimitive;

    return {
      path: lastOpenedFilePath,
      content: fileContent,
    };
  }
}
