import { ChannelFile } from '../entities/ChannelFile';

export interface ChannelFileParserService {
  parse(path: string): Promise<ChannelFile>;
}
