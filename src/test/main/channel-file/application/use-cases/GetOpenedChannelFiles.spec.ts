import { beforeEach, describe, expect, it } from 'vitest';

import { GetOpenedChannelFiles } from '@main/channel-file/application/use-cases/GetOpenedChannelFiles';
import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';
import { FileServiceMock } from '../../infrastructure/services/FileServiceMock';

let stateRepository: StateRepositoryMock;
let fileService: FileServiceMock;
let channelFileStructureChecker: ChannelFileStructureChecker;
let useCase: GetOpenedChannelFiles;

describe('GetOpenedChannelFiles', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    fileService = new FileServiceMock();
    channelFileStructureChecker = new ChannelFileStructureChecker();
    useCase = new GetOpenedChannelFiles(stateRepository, fileService, channelFileStructureChecker);
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

  it('throws an error if a channel file is invalid', async () => {
    const invalidChannelFile = ChannelFilePrimitiveMother.invalidContent();

    stateRepository.setOpenedFilePaths([invalidChannelFile.path]);
    fileService.setFileContent(invalidChannelFile.path, '{"invalid_content": true}');

    await expect(useCase.run()).rejects.toThrow(ChannelFileStructureDoesNotHaveAllowedStructure);
    stateRepository.expectGetOpenedFilePathsCalledTimes(1);
    fileService.expectReadFileUtf8CalledTimes(1);
    fileService.expectReadFileUtf8CalledWith(invalidChannelFile.path);
  });
});
