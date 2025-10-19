import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

import { ChannelFileContentPrimitiveMother } from './ChannelFileContentPrimitiveMother';

export class ChannelFilePrimitiveMother {
  static with(data: PartialDeep<ChannelFilePrimitive> = {}): ChannelFilePrimitive {
    const contentOverrides = data.content as PartialDeep<ChannelFileContentPrimitive> | undefined;

    return {
      path:
        typeof data.path === 'string' && data.path.length > 0
          ? data.path
          : ChannelFilePrimitiveMother.randomPath(),
      content:
        contentOverrides !== undefined
          ? ChannelFileContentPrimitiveMother.with(contentOverrides)
          : ChannelFileContentPrimitiveMother.random(),
    };
  }

  static random(): ChannelFilePrimitive {
    return ChannelFilePrimitiveMother.with();
  }

  static randomPath(): string {
    return faker.system.filePath();
  }

  static invalidContent(): ChannelFilePrimitive {
    return {
      path: ChannelFilePrimitiveMother.randomPath(),
      content: {
        invalidField: 'invalidValue',
      } as unknown as ChannelFileContentPrimitive,
    };
  }

  static contentString(data: PartialDeep<ChannelFileContentPrimitive> = {}): string {
    return JSON.stringify(ChannelFileContentPrimitiveMother.with(data));
  }
}
