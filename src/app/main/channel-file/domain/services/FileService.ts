import { ChannelFile } from '../entities/ChannelFile';

export interface FileService {
  readChannelFile(path: string): Promise<ChannelFile>;
}
