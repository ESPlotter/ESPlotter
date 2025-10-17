import { expect } from 'vitest';

import type { StateRepository } from '@main/channel-file/domain/repositories/StateRepository';

export class StateRepositoryMock implements StateRepository {
  private lastOpenedFilePath: string | null = null;
  private openedFilePaths: string[] = [];

  private saveOpenedFilePathsCalls: string[][] = [];
  private getLastOpenedChannelFilePathCalls = 0;
  private getOpenedFilePathsCalls = 0;

  setLastOpenedFilePath(path: string | null): void {
    this.lastOpenedFilePath = path;
  }

  setOpenedFilePaths(paths: string[]): void {
    this.openedFilePaths = [...paths];
  }

  async saveOpenedFilePaths(filePaths: string[]): Promise<void> {
    this.saveOpenedFilePathsCalls.push([...filePaths]);
    this.openedFilePaths = [...filePaths];
  }

  async getLastOpenedChannelFilePath(): Promise<string | null> {
    this.getLastOpenedChannelFilePathCalls += 1;
    return this.lastOpenedFilePath;
  }

  async getOpenedFilePaths(): Promise<string[]> {
    this.getOpenedFilePathsCalls += 1;
    return [...this.openedFilePaths];
  }

  onLastOpenedChannelFilePathChange(_cb: () => void): () => void {
    return () => undefined;
  }

  expectGetLastOpenedChannelFilePathCalledTimes(times: number): void {
    expect(this.getLastOpenedChannelFilePathCalls).toBe(times);
  }

  expectGetOpenedFilePathsCalledTimes(times: number): void {
    expect(this.getOpenedFilePathsCalls).toBe(times);
  }

  expectSaveOpenedFilePathsCalledTimes(times: number): void {
    expect(this.saveOpenedFilePathsCalls).toHaveLength(times);
  }

  expectSaveOpenedFilePathsCalledWith(expected: string[]): void {
    expect(this.saveOpenedFilePathsCalls).toContainEqual(expected);
  }
}
