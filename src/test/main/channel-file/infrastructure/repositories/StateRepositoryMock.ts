import { expect } from 'vitest';

import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';

import type { StateRepository } from '@main/channel-file/domain/repositories/StateRepository';

export class StateRepositoryMock implements StateRepository {
  private lastOpenedFile: ChannelFile | null = null;
  private openedFiles: ChannelFile[] = [];

  private saveOpenedChannelFilesCalls: ChannelFile[][] = [];
  private getLastOpenedChannelFileCalls = 0;
  private getOpenedChannelFilesCalls = 0;

  setLastOpenedFile(file: ChannelFile | null): void {
    this.lastOpenedFile = file;
  }

  setOpenedFiles(files: ChannelFile[]): void {
    this.openedFiles = [...files];
  }

  async saveOpenedChannelFiles(files: ChannelFile[]): Promise<void> {
    this.saveOpenedChannelFilesCalls.push([...files]);
    this.openedFiles = [...files];
  }

  async getLastOpenedChannelFile(): Promise<ChannelFile | null> {
    this.getLastOpenedChannelFileCalls += 1;
    return this.lastOpenedFile;
  }

  async getOpenedChannelFiles(): Promise<ChannelFile[]> {
    this.getOpenedChannelFilesCalls += 1;
    return [...this.openedFiles];
  }

  onLastOpenedChannelFileChange(_cb: (file: ChannelFile | null) => void): () => void {
    return () => undefined;
  }

  expectGetLastOpenedChannelFileCalledTimes(times: number): void {
    expect(this.getLastOpenedChannelFileCalls).toBe(times);
  }

  expectGetOpenedChannelFilesCalledTimes(times: number): void {
    expect(this.getOpenedChannelFilesCalls).toBe(times);
  }

  expectSaveOpenedChannelFilesCalledTimes(times: number): void {
    expect(this.saveOpenedChannelFilesCalls).toHaveLength(times);
  }

  expectSaveOpenedChannelFilesCalledWith(expected: string[]): void {
    const recorded = this.saveOpenedChannelFilesCalls.map((call) => call.map((file) => file.path));
    expect(recorded).toContainEqual(expected);
  }
}
