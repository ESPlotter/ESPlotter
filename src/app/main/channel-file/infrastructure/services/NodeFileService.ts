import fs from 'node:fs/promises';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';
import { FileService } from '@main/channel-file/domain/services/FileService';

export class NodeFileService implements FileService {
  constructor(private readonly structureChecker: ChannelFileStructureChecker) {}

  public async readChannelFile(path: string): Promise<ChannelFile> {
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
