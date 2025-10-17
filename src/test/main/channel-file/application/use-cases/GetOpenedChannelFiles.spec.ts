import { beforeEach, describe, expect, it } from 'vitest';
import { GetOpenedChannelFiles } from '@main/channel-file/application/use-cases/GetOpenedChannelFiles';
import { ChannelFilePrimitiveMother } from '../../domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';
import { FileServiceMock } from '../../infrastructure/services/FileServiceMock';

let stateRepository: StateRepositoryMock;
let fileService: FileServiceMock;
let useCase: GetOpenedChannelFiles;

describe('GetOpenedChannelFiles', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    fileService = new FileServiceMock();
    useCase = new GetOpenedChannelFiles(stateRepository, fileService);
  });

  it('returns an empty list when there are no opened files stored', async () => {
    const result = await useCase.run();

    expect(result).toEqual([]);
    stateRepository.expectGetOpenedFilePathsCalledTimes(1);
    fileService.expectReadFileUtf8NotCalled();
  });

  it('returns all opened channel files with content', async () => {
    const firstChannelFile = ChannelFilePrimitiveMother.random();
    const secondChannelFile = ChannelFilePrimitiveMother.random();

    stateRepository.setOpenedFilePaths([firstChannelFile.path, secondChannelFile.path]);
    fileService.setFileContent(firstChannelFile.path, JSON.stringify(firstChannelFile.content));
    fileService.setFileContent(secondChannelFile.path, JSON.stringify(secondChannelFile.content));

    const result = await useCase.run();

    stateRepository.expectGetOpenedFilePathsCalledTimes(1);
    fileService.expectReadFileUtf8CalledTimes(2);
    expect(result).toEqual([firstChannelFile, secondChannelFile]);
  });
});
