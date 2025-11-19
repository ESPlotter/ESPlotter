import { ChannelFile } from '../entities/ChannelFile';

export interface PsseOutFileService {
  transformToChannelFile(path: string): Promise<ChannelFile>;
}
