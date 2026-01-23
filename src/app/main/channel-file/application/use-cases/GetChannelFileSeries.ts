import { ChannelFileRepository } from '@main/channel-file/domain/repositories/ChannelFileRepository';
import { ChannelFileSeriesPrimitive } from '@shared/domain/primitives/ChannelFileSeriesPrimitive';

export class GetChannelFileSeries {
  constructor(private readonly repository: ChannelFileRepository) {}

  public async run(path: string, channelId: string): Promise<ChannelFileSeriesPrimitive> {
    return this.repository.readChannelSerie(path, channelId);
  }
}
