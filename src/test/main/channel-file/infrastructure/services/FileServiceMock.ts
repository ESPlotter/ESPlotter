import { expect } from 'vitest';

import type { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import type { FileService } from '@main/channel-file/domain/services/FileService';

export class FileServiceMock implements FileService {
  private readonly files = new Map<string, ChannelFile>();
  private readonly failures = new Map<string, Error>();
  private readonly readChannelFileCalls: string[] = [];

  setChannelFile(file: ChannelFile): void {
    this.files.set(file.path, file);
  }

  setFailure(path: string, error: Error): void {
    this.failures.set(path, error);
  }

  async readChannelFile(path: string): Promise<ChannelFile> {
    this.readChannelFileCalls.push(path);

    if (this.failures.has(path)) {
      throw this.failures.get(path) as Error;
    }

    if (!this.files.has(path)) {
      throw new Error(`File content not mocked for path: ${path}`);
    }

    return this.files.get(path) as ChannelFile;
  }

  expectReadChannelFileCalledTimes(times: number): void {
    expect(this.readChannelFileCalls).toHaveLength(times);
  }

  expectReadChannelFileCalledWith(path: string): void {
    expect(this.readChannelFileCalls).toContain(path);
  }

  expectReadChannelFileNthCalledWith(callIndex: number, path: string): void {
    expect(this.readChannelFileCalls.at(callIndex - 1)).toBe(path);
  }

  expectReadChannelFileNotCalled(): void {
    this.expectReadChannelFileCalledTimes(0);
  }
}
