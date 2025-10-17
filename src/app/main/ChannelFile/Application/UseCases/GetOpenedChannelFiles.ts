import { ChannelFileContentPrimitive } from '@shared/Domain/Primitives/ChannelFileContentPrimitive';
import { ChannelFilePrimitive } from '@shared/Domain/Primitives/ChannelFilePrimitive';

export class GetOpenedChannelFiles {
  constructor(
    private stateRepository: import('../../Domain/Repositories/StateRepository').StateRepository,
    private fileService: import('../../Domain/Services/FileService').FileService,
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
