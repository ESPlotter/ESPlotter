import fs from 'node:fs/promises';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { CsvTxtFileService } from '@main/channel-file/domain/services/CsvTxtFileService';
import { ChannelFileContent } from '@main/channel-file/domain/vos/ChannelFileContent';
import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

export class NodeCsvTxtFileService implements CsvTxtFileService {
  constructor() {}

  public async transformToChannelFile(filePath: string): Promise<ChannelFile> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const channelFileContent = this.parseCsvTxtContent(fileContent, filePath);

    return ChannelFile.fromPrimitives({
      path: filePath,
      content: channelFileContent.toPrimitives(),
    });
  }

  private parseCsvTxtContent(content: string, filePath: string): ChannelFileContent {
    const lines = content.split('\n').filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      throw new Error('CSV/TXT file must have at least a header row and one data row');
    }

    const headerLine = lines[0];
    const headers = headerLine.split(',').map((h) => h.trim());

    if (headers.length < 2) {
      throw new Error('CSV/TXT file must have at least 2 columns (time and one data channel)');
    }

    const dataLines = lines.slice(1);
    const columns: number[][] = Array.from({ length: headers.length }, () => []);

    for (const line of dataLines) {
      const values = line.split(',').map((v) => v.trim());

      if (values.length !== headers.length) {
        continue;
      }

      for (let i = 0; i < headers.length; i++) {
        const numValue = parseFloat(values[i]);
        if (!isNaN(numValue)) {
          columns[i].push(numValue);
        }
      }
    }

    const targetLength = Math.min(...columns.map((col) => col.length));

    if (targetLength === 0) {
      throw new Error('No valid numeric data found in CSV/TXT file');
    }

    const xSerie: ChannelFileContentSeriePrimitive = {
      id: 'time',
      label: headers[0],
      unit: 's',
      values: columns[0].slice(0, targetLength),
    };

    const series: ChannelFileContentSeriePrimitive[] = [];
    for (let i = 1; i < headers.length; i++) {
      if (columns[i].length > 0) {
        series.push({
          id: `channel_${i}`,
          label: headers[i],
          unit: '',
          values: columns[i].slice(0, targetLength),
        });
      }
    }

    const fileName = filePath.split(/[/\\]/).pop() || 'unknown';
    const shortTitle = fileName.replace(/\.(txt|csv)$/i, '');

    const contentPrimitive: ChannelFileContentPrimitive = {
      schemaVersion: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        SCR: 0,
        shortTitle,
      },
      x: xSerie,
      series,
    };

    return ChannelFileContent.fromPrimitives(contentPrimitive);
  }
}
