import path from 'node:path';

import { app } from 'electron';
import { Options as PythonShellOptions, PythonShell } from 'python-shell';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { PsseOutFileService } from '@main/channel-file/domain/services/PsseOutFileService';
import { ChannelFileContent } from '@main/channel-file/domain/vos/ChannelFileContent';
import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

export class NodePsseOutFileService implements PsseOutFileService {
  constructor() {}

  public async transformToChannelFile(filePath: string): Promise<ChannelFile> {
    const parsedOutFile = await this.callDynToolsToParseOutFile(filePath);
    const channelFileContent = this.mapParsedOutFileToChannelFileContent(parsedOutFile);

    return ChannelFile.fromPrimitives({
      path: filePath,
      content: channelFileContent.toPrimitives(),
    });
  }

  private async callDynToolsToParseOutFile(outFilePath: string): Promise<string> {
    const options: PythonShellOptions = {
      mode: 'text',
      scriptPath: path.join(app.getAppPath(), 'scripts'),
      pythonPath: 'py',
      args: [path.resolve(outFilePath)],
      env: {
        ...process.env,
        DYNTOOLS_PATH: 'C:\\Program Files\\PTI\\PSSE36\\36.3\\PSSPY313',
      },
    };

    const messages = await PythonShell.run('getParsedOutFile.py', options);
    const output = messages[0];
    return output;
  }

  private mapParsedOutFileToChannelFileContent(parsedOutFile: string): ChannelFileContent {
    const parsed = this.parsePythonOutput(parsedOutFile);
    const { x, series } = this.buildChannelSeries(parsed);

    const content: ChannelFileContentPrimitive = {
      schemaVersion: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        SCR: 0,
        shortTitle: parsed.shortTitle,
      },
      x,
      series,
    };

    return ChannelFileContent.fromPrimitives(content);
  }

  private parsePythonOutput(rawOutput: string): PythonParsedOutFile {
    const parsed = JSON.parse(rawOutput);

    this.ensureFormat(parsed);

    return parsed;
  }

  private ensureFormat(parsed: PythonParsedOutFile): void {
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.shortTitle !== 'string' ||
      typeof parsed.chid !== 'object' ||
      parsed.chid === null ||
      typeof parsed.data !== 'object' ||
      parsed.data === null
    ) {
      throw new Error('DynTools output has an unexpected format.');
    }
  }

  private buildChannelSeries(parsed: PythonParsedOutFile): {
    x: ChannelFileContentSeriePrimitive;
    series: ChannelFileContentSeriePrimitive[];
  } {
    const mappedChannels = Object.entries(parsed.data).map(([key, values]) => {
      const label = parsed.chid[key];
      return this.toMappedChannel(key, label, values);
    });

    const usableChannels = mappedChannels.filter((channel) => channel.values.length > 0);
    if (!usableChannels.length) {
      throw new Error('DynTools output has no usable channels.');
    }

    const targetLength = this.resolveTargetLength(usableChannels);
    const timeChannel =
      usableChannels.find((channel) => channel.isTime && channel.values.length > 0) ??
      usableChannels[0];

    const xSerie: ChannelFileContentSeriePrimitive = {
      id: 'time',
      label: timeChannel.label || 'time',
      unit: timeChannel.unit || 's',
      values: timeChannel.values.slice(0, targetLength),
    };

    const series = usableChannels
      .filter((channel) => channel !== timeChannel)
      .map((channel) => ({
        id: channel.key,
        label: channel.label || channel.key,
        unit: channel.unit,
        values: channel.values.slice(0, targetLength),
      }))
      .filter((serie) => serie.values.length > 0);

    return { x: xSerie, series };
  }

  private toMappedChannel(
    key: string,
    chidLabel: string | undefined,
    values: number[],
  ): MappedChannel {
    const normalizedLabel = chidLabel?.trim() || key;
    const { label, unit } = this.splitLabelAndUnit(normalizedLabel);
    const isTime =
      label.toLowerCase() === 'time' ||
      normalizedLabel.toLowerCase() === 'time' ||
      key.toLowerCase() === 'time';

    return {
      key,
      label,
      unit,
      values,
      isTime,
    };
  }

  private splitLabelAndUnit(rawLabel: string): { label: string; unit: string } {
    const trimmed = rawLabel.trim();
    const match = trimmed.match(/^(.*)\(([^)]+)\)$/);
    if (match) {
      const label = match[1].trim() || trimmed;
      const unit = match[2].trim();
      return { label, unit };
    }

    return { label: trimmed, unit: '' };
  }

  private resolveTargetLength(channels: MappedChannel[]): number {
    const lengths = channels.map((channel) => channel.values.length).filter((length) => length > 0);
    if (!lengths.length) {
      return 0;
    }

    return Math.min(...lengths);
  }
}

interface PythonParsedOutFile {
  shortTitle: string;
  chid: Record<string, string>;
  data: Record<string, number[]>;
}

interface MappedChannel {
  key: string;
  label: string;
  unit: string;
  values: number[];
  isTime: boolean;
}
