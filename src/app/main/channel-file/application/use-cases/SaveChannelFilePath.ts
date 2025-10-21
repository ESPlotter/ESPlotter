export class SaveChannelFilePath {
  constructor(
    private readonly stateRepository: import('../../domain/repositories/StateRepository').StateRepository,
    private readonly fileService: import('../../domain/services/FileService').FileService,
  ) {}

  async run(path: string): Promise<void> {
    const channelFile = await this.fileService.readChannelFile(path);
    const openedFiles = await this.stateRepository.getOpenedChannelFiles();

    const deduplicated = [
      channelFile,
      ...openedFiles.filter((openedFile) => openedFile.path !== channelFile.path),
    ];

    await this.stateRepository.saveOpenedChannelFiles(deduplicated);
  }
}
