import fs from 'node:fs/promises';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileParserService } from '@main/channel-file/domain/services/ChannelFileParserService';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';

export class NodeJsonChannelFileGetterService implements ChannelFileParserService {
  constructor(private readonly structureChecker: ChannelFileStructureChecker) {}

  public async parse(path: string): Promise<ChannelFile> {
    const fileContentText = await fs.readFile(path, 'utf-8');

    let content: unknown;
    try {
      content = JSON.parse(fileContentText);
    } catch {
      throw new ChannelFileStructureDoesNotHaveAllowedStructure();
    }

    this.structureChecker.ensure(content);

    return ChannelFile.fromPrimitives({
      path,
      content,
    });
  }
}
