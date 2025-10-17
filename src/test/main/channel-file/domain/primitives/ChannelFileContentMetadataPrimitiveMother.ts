import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

import { ChannelFileContentMetadataPrimitive } from '@shared/domain/primitives/ChannelFileContentMetadataPrimitive';

export class ChannelFileContentMetadataPrimitiveMother {
  static with(
    data: PartialDeep<ChannelFileContentMetadataPrimitive> = {},
  ): ChannelFileContentMetadataPrimitive {
    return {
      ...data,
      timestamp: data.timestamp ?? faker.date.recent().toISOString(),
      SCR: data.SCR ?? faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
    };
  }

  static random(): ChannelFileContentMetadataPrimitive {
    return ChannelFileContentMetadataPrimitiveMother.with();
  }
}
