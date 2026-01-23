import path from 'node:path';

import { app } from 'electron';
import { Options as PythonShellOptions, PythonShell } from 'python-shell';

import { OutChannelFileParserService } from '@main/channel-file/domain/services/OutChannelFileParserService';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

interface NodePsseOutFilePreviewServicePaths {
  dyntoolsPath: string;
  pythonPath: string;
}

interface ParsedOutFilePreviewResult {
  preview: ChannelFilePreviewPrimitive;
}

export class NodeOutChannelFileParserService implements OutChannelFileParserService {
  constructor(private readonly resolvePaths: () => Promise<NodePsseOutFilePreviewServicePaths>) {}

  public async parse(filePath: string, cacheDir: string): Promise<ChannelFilePreviewPrimitive> {
    const paths = await this.resolvePaths();
    return this.callDynToolsToParseOutFile(filePath, cacheDir, paths);
  }

  private async callDynToolsToParseOutFile(
    outFilePath: string,
    cacheDir: string,
    paths: NodePsseOutFilePreviewServicePaths,
  ): Promise<ChannelFilePreviewPrimitive> {
    const options: PythonShellOptions = {
      mode: 'text',
      scriptPath: this.resolveScriptsPath(),
      pythonPath: paths.pythonPath,
      args: [path.resolve(outFilePath), cacheDir],
      env: {
        ...process.env,
        DYNTOOLS_PATH: paths.dyntoolsPath,
      },
    };

    const messages = await PythonShell.run('getParsedOutFilePreview.py', options);
    const output = messages[0];
    const parsed = JSON.parse(output) as ParsedOutFilePreviewResult;
    return parsed.preview;
  }

  private resolveScriptsPath(): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'scripts');
    }

    return path.join(app.getAppPath(), 'scripts');
  }
}
