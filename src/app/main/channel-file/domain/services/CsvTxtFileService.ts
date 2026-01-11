import { ChannelFile } from '../entities/ChannelFile';

export interface CsvTxtFileService {
  transformToChannelFile(path: string): Promise<ChannelFile>;
}
