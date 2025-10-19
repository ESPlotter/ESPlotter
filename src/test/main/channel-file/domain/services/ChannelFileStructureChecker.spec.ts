import { beforeEach, describe, expect, it } from 'vitest';

import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';

import { ChannelFileContentPrimitiveMother } from '../../../../shared/domain/primitives/ChannelFileContentPrimitiveMother';

let checker: ChannelFileStructureChecker;

describe('ChannelFileStructureChecker', () => {
  beforeEach(() => {
    checker = new ChannelFileStructureChecker();
  });

  it('accepts a valid channel file structure', async () => {
    const validContent = ChannelFileContentPrimitiveMother.random();

    const result = checker.run(JSON.stringify(validContent));

    await expect(result).resolves.toBeUndefined();
  });

  it('throws when content is invalid JSON', async () => {
    const invalidContent = 'invalid content';

    const result = checker.run(invalidContent);

    await expect(result).rejects.toBeInstanceOf(ChannelFileStructureDoesNotHaveAllowedStructure);
  });

  it('throws when series contain values that are not finite numbers', async () => {
    const invalidContent = ChannelFileContentPrimitiveMother.random();
    invalidContent.series[0].values = ['not-a-number'] as unknown as number[];

    const result = checker.run(JSON.stringify(invalidContent));

    await expect(result).rejects.toBeInstanceOf(ChannelFileStructureDoesNotHaveAllowedStructure);
  });
});
