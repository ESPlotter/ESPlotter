import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export class GetLastOpenedChannelFile {
  constructor(
    private stateRepository: import('../../domain/repositories/StateRepository').StateRepository,
    private fileService: import('../../domain/services/FileService').FileService,
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
