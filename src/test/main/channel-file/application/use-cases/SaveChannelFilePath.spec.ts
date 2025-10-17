import { beforeEach, describe, expect, it } from 'vitest';

import { SaveChannelFilePath } from '@main/channel-file/application/use-cases/SaveChannelFile';
import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';
import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';

import { ChannelFileContentPrimitiveMother } from '../../../../shared/domain/primitives/ChannelFileContentPrimitiveMother';
import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';
import { FileServiceMock } from '../../infrastructure/services/FileServiceMock';

let stateRepository: StateRepositoryMock;
let fileService: FileServiceMock;
let channelFileStructureChecker: ChannelFileStructureChecker;
let useCase: SaveChannelFilePath;

describe('SaveChannelFilePath', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    fileService = new FileServiceMock();
    channelFileStructureChecker = new ChannelFileStructureChecker();
    useCase = new SaveChannelFilePath(stateRepository, fileService, channelFileStructureChecker);
  });

  it('persists the channel file path at the beginning of the list without duplicates', async () => {
    const existingPaths = [
      ChannelFilePrimitiveMother.randomPath(),
      ChannelFilePrimitiveMother.randomPath(),
    ];
    const newPath = existingPaths[1];
    const fileContent = ChannelFileContentPrimitiveMother.random();
    const fileContentString = JSON.stringify(fileContent);

    stateRepository.setOpenedFilePaths(existingPaths);
    fileService.setFileContent(newPath, fileContentString);

    await useCase.run(newPath);

    fileService.expectReadFileUtf8CalledTimes(1);
    fileService.expectReadFileUtf8CalledWith(newPath);
    stateRepository.expectGetOpenedFilePathsCalledTimes(1);
    stateRepository.expectSaveOpenedFilePathsCalledTimes(1);
    stateRepository.expectSaveOpenedFilePathsCalledWith([newPath, existingPaths[0]]);
  });

  it('does not persist channel file paths when the structure is invalid', async () => {
    const invalidChannelFile = ChannelFilePrimitiveMother.invalidContent();

    fileService.setFileContent(invalidChannelFile.path, '{"invalid_content": true}');

    await expect(useCase.run(invalidChannelFile.path)).rejects.toThrow(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
    fileService.expectReadFileUtf8CalledTimes(1);
    fileService.expectReadFileUtf8CalledWith(invalidChannelFile.path);
    stateRepository.expectGetOpenedFilePathsCalledTimes(0);
    stateRepository.expectSaveOpenedFilePathsCalledTimes(0);
  });

  it('does not persist channel file paths when the structure is not a JSON', async () => {
    const invalidChannelFile = ChannelFilePrimitiveMother.invalidContent();

    fileService.setFileContent(invalidChannelFile.path, 'invalid_content');

    await expect(useCase.run(invalidChannelFile.path)).rejects.toThrow(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
    fileService.expectReadFileUtf8CalledTimes(1);
    fileService.expectReadFileUtf8CalledWith(invalidChannelFile.path);
    stateRepository.expectGetOpenedFilePathsCalledTimes(0);
    stateRepository.expectSaveOpenedFilePathsCalledTimes(0);
  });
});
