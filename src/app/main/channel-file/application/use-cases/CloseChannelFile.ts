import { ChannelFileRepository } from '@main/channel-file/domain/repositories/ChannelFileRepository';

export class CloseChannelFile {
  constructor(private readonly repository: ChannelFileRepository) {}

  public async run(path: string): Promise<void> {
    await this.repository.removeCache(path);
  }
}
