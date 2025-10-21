import { beforeEach, describe, expect, it } from 'vitest';

import { SaveChannelFilePath } from '@main/channel-file/application/use-cases/SaveChannelFilePath';
import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';
import { ChannelFileStructureDoesNotHaveAllowedStructure } from '@main/channel-file/domain/exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';
import { FileServiceMock } from '../../infrastructure/services/FileServiceMock';

let stateRepository: StateRepositoryMock;
let fileService: FileServiceMock;
let useCase: SaveChannelFilePath;

describe('SaveChannelFilePath', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    fileService = new FileServiceMock();
    useCase = new SaveChannelFilePath(stateRepository, fileService);
  });

  it('persists the channel file path at the beginning of the list without duplicates', async () => {
    const [firstPrimitive, secondPrimitive] = [
      ChannelFilePrimitiveMother.random(),
      ChannelFilePrimitiveMother.random(),
    ];
    const firstFile = ChannelFile.fromPrimitives(firstPrimitive);
    const secondFile = ChannelFile.fromPrimitives(secondPrimitive);
    const newFile = ChannelFile.fromPrimitives(secondPrimitive);

    stateRepository.setOpenedFiles([firstFile, secondFile]);
    fileService.setChannelFile(newFile);

    await useCase.run(newFile.path);

    fileService.expectReadChannelFileCalledTimes(1);
    fileService.expectReadChannelFileCalledWith(newFile.path);
    stateRepository.expectGetOpenedChannelFilesCalledTimes(1);
    stateRepository.expectSaveOpenedChannelFilesCalledTimes(1);
    stateRepository.expectSaveOpenedChannelFilesCalledWith([newFile.path, firstFile.path]);
  });

  it('does not persist channel file paths when the structure is invalid', async () => {
    const invalidChannelFile = ChannelFilePrimitiveMother.invalidContent();

    fileService.setFailure(
      invalidChannelFile.path,
      new ChannelFileStructureDoesNotHaveAllowedStructure(),
    );

    await expect(useCase.run(invalidChannelFile.path)).rejects.toThrow(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
    fileService.expectReadChannelFileCalledTimes(1);
    fileService.expectReadChannelFileCalledWith(invalidChannelFile.path);
    stateRepository.expectGetOpenedChannelFilesCalledTimes(0);
    stateRepository.expectSaveOpenedChannelFilesCalledTimes(0);
  });

  it('does not persist channel file paths when the structure is not a JSON', async () => {
    const invalidChannelFile = ChannelFilePrimitiveMother.invalidContent();

    fileService.setFailure(
      invalidChannelFile.path,
      new ChannelFileStructureDoesNotHaveAllowedStructure(),
    );

    await expect(useCase.run(invalidChannelFile.path)).rejects.toThrow(
      ChannelFileStructureDoesNotHaveAllowedStructure,
    );
    fileService.expectReadChannelFileCalledTimes(1);
    fileService.expectReadChannelFileCalledWith(invalidChannelFile.path);
    stateRepository.expectGetOpenedChannelFilesCalledTimes(0);
    stateRepository.expectSaveOpenedChannelFilesCalledTimes(0);
  });
});
