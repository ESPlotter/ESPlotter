import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export class GetOpenedChannelFiles {
  constructor(
    private stateRepository: import('../../domain/repositories/StateRepository').StateRepository,
    private fileService: import('../../domain/services/FileService').FileService,
    private channelFileStructureChecker: import('../../domain/services/ChannelFileStructureChecker').ChannelFileStructureChecker,
  ) {}

  async run(): Promise<ChannelFilePrimitive[]> {
    const currentOpenedFilePaths = await this.stateRepository.getOpenedFilePaths();

    return Promise.all(
      currentOpenedFilePaths.map(async (filePath) => {
        const fileContentText = await this.fileService.readFileUtf8(filePath);
        await this.channelFileStructureChecker.run(fileContentText);

        return {
          path: filePath,
          content: JSON.parse(fileContentText),
        };
      }),
    );
  }
}
