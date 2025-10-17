export class SaveChannelFilePath {
  constructor(
    private stateRepository: import('../../Domain/Repositories/StateRepository').StateRepository,
    private fileService: import('../../Domain/Services/FileService').FileService,
    private channelFileStructureChecker: import('../../Domain/Services/ChannelFileStructureChecker').ChannelFileStructureChecker,
  ) {}

  async run(path: string): Promise<void> {
    const file = await this.fileService.readFileUtf8(path);
    await this.channelFileStructureChecker.run(file);

    const currentOpenedFilePaths = await this.stateRepository.getOpenedFilePaths();
    const newOpenedFilePaths = [...new Set([path, ...currentOpenedFilePaths])];

    return this.stateRepository.saveOpenedFilePaths(newOpenedFilePaths);
  }
}
