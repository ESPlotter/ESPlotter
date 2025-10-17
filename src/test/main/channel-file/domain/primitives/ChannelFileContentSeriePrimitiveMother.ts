import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

const DEFAULT_NUMBER_OF_POINTS = 5;

export class ChannelFileContentSeriePrimitiveMother {
  static with(
    data: PartialDeep<ChannelFileContentSeriePrimitive> = {},
  ): ChannelFileContentSeriePrimitive {
    return {
      id: data.id ?? faker.string.alphanumeric({ casing: 'upper' }),
      label: data.label ?? faker.science.unit().name,
      unit: data.unit ?? faker.science.unit().symbol,
      values:
        data.values ??
        Array.from({ length: DEFAULT_NUMBER_OF_POINTS }, () =>
          faker.number.float({ min: 0, max: 100, fractionDigits: 4 }),
        ),
    };
  }

  static random(): ChannelFileContentSeriePrimitive {
    return ChannelFileContentSeriePrimitiveMother.with();
  }
}
