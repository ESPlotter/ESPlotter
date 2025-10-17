import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export class GetOpenedChannelFiles {
  constructor(
    private stateRepository: import('../../domain/repositories/StateRepository').StateRepository,
    private fileService: import('../../domain/services/FileService').FileService,
  ) {}

  async run(): Promise<ChannelFilePrimitive[]> {
    const currentOpenedFilePaths = await this.stateRepository.getOpenedFilePaths();

    return Promise.all(
      currentOpenedFilePaths.map(async (filePath) => {
        const fileContentText = await this.fileService.readFileUtf8(filePath);
        const fileContent = JSON.parse(fileContentText) as ChannelFileContentPrimitive;

        return {
          path: filePath,
          content: fileContent,
        };
      }),
    );
  }
}
