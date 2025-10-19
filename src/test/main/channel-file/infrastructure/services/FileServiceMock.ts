import { expect } from 'vitest';

import type { FileService } from '@main/channel-file/domain/services/FileService';

export class FileServiceMock implements FileService {
  private readonly files = new Map<string, string>();
  private readonly readFileUtf8Calls: string[] = [];

  setFileContent(path: string, content: string): void {
    this.files.set(path, content);
  }

  async readFileUtf8(path: string): Promise<string> {
    this.readFileUtf8Calls.push(path);

    if (!this.files.has(path)) {
      throw new Error(`File content not mocked for path: ${path}`);
    }

    return this.files.get(path) as string;
  }

  expectReadFileUtf8CalledTimes(times: number): void {
    expect(this.readFileUtf8Calls).toHaveLength(times);
  }

  expectReadFileUtf8CalledWith(path: string): void {
    expect(this.readFileUtf8Calls).toContain(path);
  }

  expectReadFileUtf8NthCalledWith(callIndex: number, path: string): void {
    expect(this.readFileUtf8Calls.at(callIndex - 1)).toBe(path);
  }

  expectReadFileUtf8NotCalled(): void {
    this.expectReadFileUtf8CalledTimes(0);
  }
}
