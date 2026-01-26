import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFileRepository } from '@main/channel-file/domain/repositories/ChannelFileRepository';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';
import { ChannelFileSeriesPrimitive } from '@shared/domain/primitives/ChannelFileSeriesPrimitive';

export class ChannelFileRepositoryMock implements ChannelFileRepository {
  private cachedPreview: ChannelFilePreviewPrimitive | null = null;
  private cachedSeries: ChannelFileSeriesPrimitive | null = null;
  private cacheDir = 'cache-dir';
  private savePreview: ChannelFilePreviewPrimitive | null = null;
  private shouldFailOnSave = false;
  private readChannelsCallCount = 0;
  private readChannelSerieCallCount = 0;
  private prepareCacheCallCount = 0;
  private saveCallCount = 0;
  private removeCallCount = 0;
  private lastReadChannelsPath: string | null = null;
  private lastReadChannelSeriePath: string | null = null;
  private lastReadChannelSerieId: string | null = null;
  private lastPrepareCachePath: string | null = null;
  private lastSaveCacheDir: string | null = null;
  private lastSavedChannelFile: ChannelFile | null = null;
  private lastRemovedPath: string | null = null;

  async readChannels(path: string): Promise<ChannelFilePreviewPrimitive | null> {
    this.readChannelsCallCount += 1;
    this.lastReadChannelsPath = path;
    return this.cachedPreview;
  }

  async readChannelSerie(path: string, channelId: string): Promise<ChannelFileSeriesPrimitive> {
    this.readChannelSerieCallCount += 1;
    this.lastReadChannelSeriePath = path;
    this.lastReadChannelSerieId = channelId;

    if (!this.cachedSeries) {
      throw new Error('Channel file series was not configured');
    }

    return this.cachedSeries;
  }

  async prepareCache(path: string): Promise<string> {
    this.prepareCacheCallCount += 1;
    this.lastPrepareCachePath = path;
    return this.cacheDir;
  }

  async save(cacheDir: string, channelFile: ChannelFile): Promise<ChannelFilePreviewPrimitive> {
    this.saveCallCount += 1;
    this.lastSaveCacheDir = cacheDir;
    this.lastSavedChannelFile = channelFile;

    if (this.shouldFailOnSave) {
      throw new Error('Channel file repository save failed');
    }

    return this.savePreview ?? channelFile.toPreviewPrimitives();
  }

  async remove(path: string): Promise<void> {
    this.removeCallCount += 1;
    this.lastRemovedPath = path;
  }

  setCachedPreview(preview: ChannelFilePreviewPrimitive | null): void {
    this.cachedPreview = preview;
  }

  setCachedSeries(series: ChannelFileSeriesPrimitive): void {
    this.cachedSeries = series;
  }

  setCacheDir(cacheDir: string): void {
    this.cacheDir = cacheDir;
  }

  setSavePreview(preview: ChannelFilePreviewPrimitive): void {
    this.savePreview = preview;
  }

  failOnSave(): void {
    this.shouldFailOnSave = true;
  }

  expectReadChannelsCalledTimes(times: number): void {
    if (this.readChannelsCallCount !== times) {
      throw new Error(
        `Expected readChannels to be called ${times} times but was ${this.readChannelsCallCount}`,
      );
    }
  }

  expectReadChannelSerieCalledTimes(times: number): void {
    if (this.readChannelSerieCallCount !== times) {
      throw new Error(
        `Expected readChannelSerie to be called ${times} times but was ${this.readChannelSerieCallCount}`,
      );
    }
  }

  expectPrepareCacheCalledTimes(times: number): void {
    if (this.prepareCacheCallCount !== times) {
      throw new Error(
        `Expected prepareCache to be called ${times} times but was ${this.prepareCacheCallCount}`,
      );
    }
  }

  expectSaveCalledTimes(times: number): void {
    if (this.saveCallCount !== times) {
      throw new Error(`Expected save to be called ${times} times but was ${this.saveCallCount}`);
    }
  }

  expectRemoveCalledTimes(times: number): void {
    if (this.removeCallCount !== times) {
      throw new Error(
        `Expected remove to be called ${times} times but was ${this.removeCallCount}`,
      );
    }
  }

  expectLastReadChannelsPath(expected: string): void {
    if (this.lastReadChannelsPath !== expected) {
      throw new Error(
        `Expected readChannels to be called with ${expected} but was ${this.lastReadChannelsPath ?? 'null'}`,
      );
    }
  }

  expectLastReadChannelSerieArgs(expectedPath: string, expectedChannelId: string): void {
    if (this.lastReadChannelSeriePath !== expectedPath) {
      throw new Error(
        `Expected readChannelSerie to be called with path ${expectedPath} but was ${
          this.lastReadChannelSeriePath ?? 'null'
        }`,
      );
    }

    if (this.lastReadChannelSerieId !== expectedChannelId) {
      throw new Error(
        `Expected readChannelSerie to be called with channel ${expectedChannelId} but was ${
          this.lastReadChannelSerieId ?? 'null'
        }`,
      );
    }
  }

  expectLastPrepareCachePath(expected: string): void {
    if (this.lastPrepareCachePath !== expected) {
      throw new Error(
        `Expected prepareCache to be called with ${expected} but was ${this.lastPrepareCachePath ?? 'null'}`,
      );
    }
  }

  expectLastSaveArgs(expectedCacheDir: string, expectedPath: string): void {
    if (this.lastSaveCacheDir !== expectedCacheDir) {
      throw new Error(
        `Expected save to be called with cache dir ${expectedCacheDir} but was ${
          this.lastSaveCacheDir ?? 'null'
        }`,
      );
    }

    if (this.lastSavedChannelFile?.path !== expectedPath) {
      throw new Error(
        `Expected save to be called with channel file ${expectedPath} but was ${
          this.lastSavedChannelFile?.path ?? 'null'
        }`,
      );
    }
  }

  expectLastRemovedPath(expected: string): void {
    if (this.lastRemovedPath !== expected) {
      throw new Error(
        `Expected remove to be called with ${expected} but was ${this.lastRemovedPath ?? 'null'}`,
      );
    }
  }
}
