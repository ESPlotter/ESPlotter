import { beforeEach, describe, expect, it } from 'vitest';

import { GetOpenedChannelFiles } from '@main/channel-file/application/use-cases/GetOpenedChannelFiles';
import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';

let stateRepository: StateRepositoryMock;
let useCase: GetOpenedChannelFiles;

describe('GetOpenedChannelFiles', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    useCase = new GetOpenedChannelFiles(stateRepository);
  });

  it('returns an empty list when there are no opened files stored', async () => {
    const result = await useCase.run();

    expect(result).toEqual([]);
    stateRepository.expectGetOpenedChannelFilesCalledTimes(1);
  });

  it('returns all opened channel files with content', async () => {
    const firstChannelFile = ChannelFile.fromPrimitives(ChannelFilePrimitiveMother.random());
    const secondChannelFile = ChannelFile.fromPrimitives(ChannelFilePrimitiveMother.random());

    stateRepository.setOpenedFiles([firstChannelFile, secondChannelFile]);

    const result = await useCase.run();

    stateRepository.expectGetOpenedChannelFilesCalledTimes(1);
    expect(result).toEqual([firstChannelFile.toPrimitives(), secondChannelFile.toPrimitives()]);
  });
});
