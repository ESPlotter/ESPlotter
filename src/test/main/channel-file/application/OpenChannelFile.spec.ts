import { beforeEach, describe, expect, it } from 'vitest';

import { OpenChannelFile } from '@main/channel-file/application/use-cases/OpenChannelFile';
import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFileParserService } from '@main/channel-file/domain/services/ChannelFileParserService';
import { OutChannelFileParserService } from '@main/channel-file/domain/services/OutChannelFileParserService';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

import { ChannelFilePrimitiveMother } from '../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { ChannelFileRepositoryMock } from '../infrastructure/repositories/ChannelFileRepositoryMock';

class ChannelFileParserServiceMock implements ChannelFileParserService {
  private callCount = 0;
  private lastPath: string | null = null;
  private shouldFail = false;

  constructor(private parsedFile: ChannelFile) {}

  async parse(path: string): Promise<ChannelFile> {
    this.callCount += 1;
    this.lastPath = path;

    if (this.shouldFail) {
      throw new Error('Channel file parsing failed');
    }

    return this.parsedFile;
  }

  setParsedFile(file: ChannelFile): void {
    this.parsedFile = file;
  }

  fail(): void {
    this.shouldFail = true;
  }

  expectCalledTimes(times: number): void {
    if (this.callCount !== times) {
      throw new Error(`Expected parse to be called ${times} times but was ${this.callCount}`);
    }
  }

  expectLastPath(expected: string): void {
    if (this.lastPath !== expected) {
      throw new Error(
        `Expected parse to be called with ${expected} but was ${this.lastPath ?? 'null'}`,
      );
    }
  }
}

class OutChannelFileParserServiceMock implements OutChannelFileParserService {
  private callCount = 0;
  private lastPath: string | null = null;
  private lastCacheDir: string | null = null;
  private shouldFail = false;

  constructor(private preview: ChannelFilePreviewPrimitive) {}

  async parse(path: string, cacheDir: string): Promise<ChannelFilePreviewPrimitive> {
    this.callCount += 1;
    this.lastPath = path;
    this.lastCacheDir = cacheDir;

    if (this.shouldFail) {
      throw new Error('Out file parsing failed');
    }

    return this.preview;
  }

  setPreview(preview: ChannelFilePreviewPrimitive): void {
    this.preview = preview;
  }

  fail(): void {
    this.shouldFail = true;
  }

  expectCalledTimes(times: number): void {
    if (this.callCount !== times) {
      throw new Error(`Expected parse to be called ${times} times but was ${this.callCount}`);
    }
  }

  expectLastArgs(expectedPath: string, expectedCacheDir: string): void {
    if (this.lastPath !== expectedPath) {
      throw new Error(
        `Expected parse to be called with ${expectedPath} but was ${this.lastPath ?? 'null'}`,
      );
    }

    if (this.lastCacheDir !== expectedCacheDir) {
      throw new Error(
        `Expected parse to be called with cache dir ${expectedCacheDir} but was ${
          this.lastCacheDir ?? 'null'
        }`,
      );
    }
  }
}

describe('OpenChannelFile', () => {
  let repository: ChannelFileRepositoryMock;
  let csvParser: ChannelFileParserServiceMock;
  let jsonParser: ChannelFileParserServiceMock;
  let outParser: OutChannelFileParserServiceMock;
  let useCase: OpenChannelFile;

  beforeEach(() => {
    repository = new ChannelFileRepositoryMock();
    csvParser = new ChannelFileParserServiceMock(createChannelFile('/path/to/file.csv'));
    jsonParser = new ChannelFileParserServiceMock(createChannelFile('/path/to/file.json'));
    outParser = new OutChannelFileParserServiceMock(
      createChannelFile('/path/to/file.out').toPreviewPrimitives(),
    );
    useCase = new OpenChannelFile(repository, jsonParser, csvParser, outParser);
  });

  it('returns cached preview without parsing', async () => {
    const path = '/path/to/file.csv';
    const preview = createChannelFile(path).toPreviewPrimitives();
    repository.setCachedPreview(preview);

    const result = await useCase.run(path);

    expect(result).toEqual(preview);
    repository.expectReadChannelsCalledTimes(1);
    repository.expectLastReadChannelsPath(path);
    repository.expectPrepareCacheCalledTimes(0);
    repository.expectSaveCalledTimes(0);
    repository.expectRemoveCalledTimes(0);
    csvParser.expectCalledTimes(0);
    jsonParser.expectCalledTimes(0);
    outParser.expectCalledTimes(0);
  });

  it('parses out files using the out parser', async () => {
    const path = '/path/to/report.out';
    const cacheDir = '/tmp/cache-dir';
    const preview = createChannelFile(path).toPreviewPrimitives();
    repository.setCacheDir(cacheDir);
    outParser.setPreview(preview);

    const result = await useCase.run(path);

    expect(result).toEqual(preview);
    repository.expectReadChannelsCalledTimes(1);
    repository.expectPrepareCacheCalledTimes(1);
    repository.expectLastPrepareCachePath(path);
    repository.expectSaveCalledTimes(0);
    outParser.expectCalledTimes(1);
    outParser.expectLastArgs(path, cacheDir);
    csvParser.expectCalledTimes(0);
    jsonParser.expectCalledTimes(0);
  });

  for (const extension of ['csv', 'txt']) {
    it(`parses ${extension} files and stores them in cache`, async () => {
      const path = `/path/to/file.${extension}`;
      const cacheDir = '/tmp/cache-dir';
      const channelFile = createChannelFile(path);
      const preview = channelFile.toPreviewPrimitives();
      repository.setCacheDir(cacheDir);
      csvParser.setParsedFile(channelFile);

      const result = await useCase.run(path);

      expect(result).toEqual(preview);
      repository.expectReadChannelsCalledTimes(1);
      repository.expectPrepareCacheCalledTimes(1);
      repository.expectSaveCalledTimes(1);
      repository.expectLastSaveArgs(cacheDir, path);
      csvParser.expectCalledTimes(1);
      csvParser.expectLastPath(path);
      jsonParser.expectCalledTimes(0);
      outParser.expectCalledTimes(0);
    });
  }

  it('parses json files using the json parser', async () => {
    const path = '/path/to/file.json';
    const cacheDir = '/tmp/cache-dir';
    const channelFile = createChannelFile(path);
    const preview = channelFile.toPreviewPrimitives();
    repository.setCacheDir(cacheDir);
    jsonParser.setParsedFile(channelFile);

    const result = await useCase.run(path);

    expect(result).toEqual(preview);
    repository.expectReadChannelsCalledTimes(1);
    repository.expectPrepareCacheCalledTimes(1);
    repository.expectSaveCalledTimes(1);
    repository.expectLastSaveArgs(cacheDir, path);
    jsonParser.expectCalledTimes(1);
    jsonParser.expectLastPath(path);
    csvParser.expectCalledTimes(0);
    outParser.expectCalledTimes(0);
  });

  it('removes cache when parsing fails', async () => {
    const path = '/path/to/file.csv';
    repository.setCacheDir('/tmp/cache-dir');
    csvParser.fail();

    await expect(useCase.run(path)).rejects.toThrow('Channel file parsing failed');

    repository.expectRemoveCalledTimes(1);
    repository.expectLastRemovedPath(path);
    repository.expectSaveCalledTimes(0);
  });

  it('removes cache when persistence fails', async () => {
    const path = '/path/to/file.csv';
    repository.setCacheDir('/tmp/cache-dir');
    repository.failOnSave();

    await expect(useCase.run(path)).rejects.toThrow('Channel file repository save failed');

    repository.expectRemoveCalledTimes(1);
    repository.expectLastRemovedPath(path);
  });

  it('removes cache for unsupported extensions', async () => {
    const path = '/path/to/file.unsupported';
    repository.setCacheDir('/tmp/cache-dir');

    await expect(useCase.run(path)).rejects.toThrow('Unsupported file extension');

    repository.expectPrepareCacheCalledTimes(1);
    repository.expectRemoveCalledTimes(1);
    repository.expectLastRemovedPath(path);
  });
});

function createChannelFile(path: string): ChannelFile {
  return ChannelFile.fromPrimitives(ChannelFilePrimitiveMother.with({ path }));
}
