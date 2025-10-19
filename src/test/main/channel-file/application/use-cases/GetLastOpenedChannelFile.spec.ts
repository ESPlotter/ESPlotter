import { describe, expect, it, beforeEach } from 'vitest';

import { GetLastOpenedChannelFile } from '@main/channel-file/application/use-cases/GetLastOpenedChannelFile';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';
import { FileServiceMock } from '../../infrastructure/services/FileServiceMock';

let stateRepository: StateRepositoryMock;
let fileService: FileServiceMock;
let useCase: GetLastOpenedChannelFile;

describe('GetLastOpenedChannelFile', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    fileService = new FileServiceMock();
    useCase = new GetLastOpenedChannelFile(stateRepository, fileService);
  });

  it('returns null when there is no stored last opened file path', async () => {
    const result = await useCase.run();

    expect(result).toBeNull();
    stateRepository.expectGetLastOpenedChannelFilePathCalledTimes(1);
  });

  it('returns the last opened channel file with its parsed content', async () => {
    const expectedChannelFile = ChannelFilePrimitiveMother.random();

    stateRepository.setLastOpenedFilePath(expectedChannelFile.path);
    fileService.setFileContent(
      expectedChannelFile.path,
      JSON.stringify(expectedChannelFile.content),
    );

    const result = await useCase.run();

    stateRepository.expectGetLastOpenedChannelFilePathCalledTimes(1);
    fileService.expectReadFileUtf8CalledTimes(1);
    fileService.expectReadFileUtf8CalledWith(expectedChannelFile.path);
    expect(result).toEqual(expectedChannelFile);
  });
});
