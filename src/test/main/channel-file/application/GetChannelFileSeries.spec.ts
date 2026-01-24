import { beforeEach, describe, expect, it } from 'vitest';

import { GetChannelFileSeries } from '@main/channel-file/application/use-cases/GetChannelFileSeries';
import { ChannelFileSeriesPrimitive } from '@shared/domain/primitives/ChannelFileSeriesPrimitive';

import { ChannelFileContentSeriePrimitiveMother } from '../../../shared/domain/primitives/ChannelFileContentSeriePrimitiveMother';
import { ChannelFileRepositoryMock } from '../infrastructure/repositories/ChannelFileRepositoryMock';

describe('GetChannelFileSeries', () => {
  let repository: ChannelFileRepositoryMock;
  let useCase: GetChannelFileSeries;

  beforeEach(() => {
    repository = new ChannelFileRepositoryMock();
    useCase = new GetChannelFileSeries(repository);
  });

  it('returns the requested channel series', async () => {
    const path = '/path/to/file.csv';
    const xSerie = ChannelFileContentSeriePrimitiveMother.with({ id: 'time' });
    const channelSerie = ChannelFileContentSeriePrimitiveMother.with({ id: 'voltage' });
    const series: ChannelFileSeriesPrimitive = {
      x: xSerie,
      channel: channelSerie,
    };
    repository.setCachedSeries(series);

    const result = await useCase.run(path, channelSerie.id);

    expect(result).toEqual(series);
    repository.expectReadChannelSerieCalledTimes(1);
    repository.expectLastReadChannelSerieArgs(path, channelSerie.id);
  });
});
