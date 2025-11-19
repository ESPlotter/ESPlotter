export class IngestPsseOutFilePath {
  constructor(
    private readonly stateRepository: import('../../domain/repositories/ChannelFileStateRepository').ChannelFileStateRepository,
    private readonly fileService: import('../../domain/services/PsseOutFileService').PsseOutFileService,
  ) {}

  async run(path: string): Promise<void> {
    const channelFile = await this.fileService.transformToChannelFile(path);
    const openedFiles = await this.stateRepository.getOpenedChannelFiles();

    const deduplicated = [
      channelFile,
      ...openedFiles.filter((openedFile) => openedFile.path !== channelFile.path),
    ];

    await this.stateRepository.saveOpenedChannelFiles(deduplicated);
  }
}
