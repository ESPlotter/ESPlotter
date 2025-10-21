import { beforeEach, describe, expect, it } from 'vitest';

import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';

import { ChannelFileContentPrimitiveMother } from '../../../../shared/domain/primitives/ChannelFileContentPrimitiveMother';

let checker: ChannelFileStructureChecker;

describe('ChannelFileStructureChecker', () => {
  beforeEach(() => {
    checker = new ChannelFileStructureChecker();
  });

  it('accepts a valid channel file structure', () => {
    const validContent = ChannelFileContentPrimitiveMother.random();

    expect(() => checker.ensure(validContent)).not.toThrow();
  });

  it('throws when content is not an object', () => {
    const invalidContent = 'invalid content';

    expect(() => checker.ensure(invalidContent)).toThrow(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
  });

  it('throws when series contain values that are not finite numbers', () => {
    const invalidContent = ChannelFileContentPrimitiveMother.random();
    invalidContent.series[0].values = ['not-a-number'] as unknown as number[];

    expect(() => checker.ensure(invalidContent)).toThrow(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
  });
});
