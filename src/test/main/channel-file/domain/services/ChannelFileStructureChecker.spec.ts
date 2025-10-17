import { describe, expect, it } from 'vitest';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';
import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileContentPrimitiveMother } from '../primitives/ChannelFileContentPrimitiveMother';

describe('ChannelFileStructureChecker', () => {
  it('accepts a valid channel file structure', async () => {
    const checker = new ChannelFileStructureChecker();
    const validContent = ChannelFileContentPrimitiveMother.random();

    await expect(checker.run(JSON.stringify(validContent))).resolves.toBeUndefined();
  });

  it('throws when the metadata is missing the SCR property', async () => {
    const checker = new ChannelFileStructureChecker();
    const invalidContent = ChannelFileContentPrimitiveMother.random();
    delete (invalidContent.metadata as Record<string, unknown>).SCR;

    await expect(checker.run(JSON.stringify(invalidContent))).rejects.toBeInstanceOf(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
  });

  it('throws when series contain values that are not finite numbers', async () => {
    const checker = new ChannelFileStructureChecker();
    const invalidContent = ChannelFileContentPrimitiveMother.random();
    invalidContent.series[0].values = ['not-a-number'] as unknown as number[];

    await expect(checker.run(JSON.stringify(invalidContent))).rejects.toBeInstanceOf(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
  });
});
