import fs from 'node:fs/promises';
import path from 'node:path';

import { app } from 'electron';
import { Options as PythonShellOptions, PythonShell } from 'python-shell';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { PsseOutFileService } from '@main/channel-file/domain/services/PsseOutFileService';
import { ChannelFileContent } from '@main/channel-file/domain/vos/ChannelFileContent';

export class NodePsseOutFileService implements PsseOutFileService {
  constructor() {}

  public async transformToChannelFile(filePath: string): Promise<ChannelFile> {
    const content = await fs.readFile(filePath, 'utf-8');

    const parsedOutFile = await this.callDynToolsToParseOutFile(filePath);
    const channelFileContent = await this.mapParsedOutFileToChannelFileContent(parsedOutFile);

    return ChannelFile.fromPrimitives({
      path: filePath,
      content: channelFileContent,
    });
  }

  private async callDynToolsToParseOutFile(_path: string): Promise<string> {
    const appPath = app.getAppPath();
    const scriptsDir = path.join(appPath, 'scripts');

    const options: PythonShellOptions = {
      mode: 'text',
      scriptPath: scriptsDir,
      // pythonPath: '/usr/bin/python3'
      args: [],
    };

    try {
      const messages = await PythonShell.run('hi.py', options);
      const output = messages.join('\n');
      return output;
    } catch (err) {
      console.error('[NodePsseOutFileService] Error running python script:', err);
      throw Error('Failed to parse .out file using DynTools.');
    }
  }

  private mapParsedOutFileToChannelFileContent(parsedOutFile: string): ChannelFileContent {
    throw new Error('Method not implemented.');
  }
}
