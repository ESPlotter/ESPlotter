import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

import { ChannelFileContentMetadataPrimitiveMother } from './ChannelFileContentMetadataPrimitiveMother';
import { ChannelFileContentSeriePrimitiveMother } from './ChannelFileContentSeriePrimitiveMother';

export class ChannelFileContentPrimitiveMother {
  static with(data: PartialDeep<ChannelFileContentPrimitive> = {}): ChannelFileContentPrimitive {
    return {
      schemaVersion: data.schemaVersion ?? 1,
      metadata: ChannelFileContentMetadataPrimitiveMother.with(data.metadata),
      x: ChannelFileContentSeriePrimitiveMother.with(data.x),
      series: ChannelFileContentPrimitiveMother.resolveSeries(data.series),
    };
  }

  static random(): ChannelFileContentPrimitive {
    return ChannelFileContentPrimitiveMother.with();
  }

  private static resolveSeries(
    series: PartialDeep<ChannelFileContentSeriePrimitive[]> | undefined,
  ): ChannelFileContentSeriePrimitive[] {
    if (!series) {
      const numberOfSeries = faker.number.int({ min: 1, max: 3 });

      return Array.from({ length: numberOfSeries }, () =>
        ChannelFileContentSeriePrimitiveMother.random(),
      );
    }

    return series.map((serie) => ChannelFileContentSeriePrimitiveMother.with(serie));
  }
}
