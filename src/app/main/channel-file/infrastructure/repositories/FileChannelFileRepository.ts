import fs from 'node:fs/promises';
import path from 'node:path';

import { app } from 'electron';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFileRepository } from '@main/channel-file/domain/repositories/ChannelFileRepository';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';
import { ChannelFileSeriesPrimitive } from '@shared/domain/primitives/ChannelFileSeriesPrimitive';
import { StateRepository } from '@shared/domain/repositories/StateRepository';

export class FileChannelFileRepository implements ChannelFileRepository {
  constructor(private readonly stateRepository: StateRepository) {}

  public async readChannels(filePath: string): Promise<ChannelFilePreviewPrimitive | null> {
    const cacheDir = this.getCacheDir(filePath);
    if (!cacheDir) {
      return null;
    }

    const preview = await this.readPreviewFromCache(cacheDir);
    if (!preview) {
      this.stateRepository.removeCachedChannelFile(filePath);
      return null;
    }

    return preview;
  }

  public async readChannelSerie(
    filePath: string,
    channelId: string,
  ): Promise<ChannelFileSeriesPrimitive> {
    const cacheDir = this.getCacheDirOrThrow(filePath);
    const preview = await this.readChannels(filePath);
    if (!preview) {
      throw new Error(`Cache preview not found for path ${filePath}.`);
    }

    const channelDescriptor = preview.content.series.find((serie) => serie.id === channelId);
    if (!channelDescriptor) {
      throw new Error(`Channel ${channelId} not found in file ${preview.path}.`);
    }

    const xDescriptor = preview.content.x;
    const xPath = path.join(cacheDir, 'x.json');
    const seriesPath = path.join(cacheDir, 'series', `${channelId}.json`);

    const [xRaw, seriesRaw] = await Promise.all([
      fs.readFile(xPath, 'utf-8'),
      fs.readFile(seriesPath, 'utf-8'),
    ]);

    const xValues = JSON.parse(xRaw) as number[];
    const channelValues = JSON.parse(seriesRaw) as number[];

    return {
      x: {
        id: xDescriptor.id,
        label: xDescriptor.label,
        unit: xDescriptor.unit,
        values: xValues,
      },
      channel: {
        id: channelDescriptor.id,
        label: channelDescriptor.label,
        unit: channelDescriptor.unit,
        values: channelValues,
      },
    };
  }

  public async prepareCache(filePath: string): Promise<string> {
    const userDataDir = process.env.ESPLOTTER_USER_DATA_DIR ?? app.getPath('userData');
    const baseDir = path.join(userDataDir, 'import-cache');
    await fs.mkdir(baseDir, { recursive: true });
    const cacheDir = await fs.mkdtemp(path.join(baseDir, 'file-'));
    this.stateRepository.setCachedChannelFile({ path: filePath, cacheDir });
    return cacheDir;
  }

  public async save(
    cacheDir: string,
    channelFile: ChannelFile,
  ): Promise<ChannelFilePreviewPrimitive> {
    const preview = channelFile.toPreviewPrimitives();
    const seriesDir = path.join(cacheDir, 'series');
    await fs.mkdir(seriesDir, { recursive: true });

    await Promise.all([
      fs.writeFile(path.join(cacheDir, 'x.json'), JSON.stringify(channelFile.content.x.values)),
      fs.writeFile(path.join(cacheDir, 'preview.json'), JSON.stringify(preview)),
      ...channelFile.content.series.map((serie) =>
        fs.writeFile(path.join(seriesDir, `${serie.id}.json`), JSON.stringify(serie.values)),
      ),
    ]);

    return preview;
  }

  public async remove(filePath: string): Promise<void> {
    const cacheDir = this.getCacheDir(filePath);
    if (!cacheDir) {
      return;
    }

    await fs.rm(cacheDir, { recursive: true, force: true });
    this.stateRepository.removeCachedChannelFile(filePath);
  }

  private getCacheDir(filePath: string): string | null {
    return this.stateRepository.getCachedChannelFile(filePath)?.cacheDir ?? null;
  }

  private getCacheDirOrThrow(filePath: string): string {
    const cacheDir = this.getCacheDir(filePath);
    if (!cacheDir) {
      throw new Error(`Cache not found for path ${filePath}.`);
    }

    return cacheDir;
  }

  private async readPreviewFromCache(
    cacheDir: string,
  ): Promise<ChannelFilePreviewPrimitive | null> {
    const previewPath = path.join(cacheDir, 'preview.json');

    try {
      const previewRaw = await fs.readFile(previewPath, 'utf-8');
      return JSON.parse(previewRaw) as ChannelFilePreviewPrimitive;
    } catch {
      return null;
    }
  }
}
