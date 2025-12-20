import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

import { ChannelFileContentMetadataPrimitive } from '@shared/domain/primitives/ChannelFileContentMetadataPrimitive';
import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

import { ChannelFileContentMetadataPrimitiveMother } from './ChannelFileContentMetadataPrimitiveMother';
import { ChannelFileContentSeriePrimitiveMother } from './ChannelFileContentSeriePrimitiveMother';

export class ChannelFileContentPrimitiveMother {
  static with(data: PartialDeep<ChannelFileContentPrimitive> = {}): ChannelFileContentPrimitive {
    const newData = data as PartialDeep<{
      schemaVersion: number;
      metadata: ChannelFileContentMetadataPrimitive;
      x: ChannelFileContentSeriePrimitive;
      series: ChannelFileContentSeriePrimitive[];
    }>;
    return {
      schemaVersion: newData.schemaVersion ?? 1,
      metadata: ChannelFileContentMetadataPrimitiveMother.with(newData.metadata),
      x: ChannelFileContentSeriePrimitiveMother.with(newData.x),
      series: ChannelFileContentPrimitiveMother.resolveSeries(newData.series),
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
