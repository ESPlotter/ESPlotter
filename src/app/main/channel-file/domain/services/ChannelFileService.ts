import { ChannelFile } from '../entities/ChannelFile';

export interface ChannelFileService {
  readChannelFile(path: string): Promise<ChannelFile>;
}
