import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

import { CsvTxtFileService } from '../../domain/services/CsvTxtFileService';

export class ReadCsvTxtFilePath {
  constructor(private readonly fileService: CsvTxtFileService) {}

  async run(path: string): Promise<ChannelFilePrimitive> {
    const channelFile = await this.fileService.transformToChannelFile(path);
    return channelFile.toPrimitives();
  }
}
