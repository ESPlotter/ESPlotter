import { describe, expect, it, beforeEach } from 'vitest';

import { GetLastOpenedChannelFile } from '@main/channel-file/application/use-cases/GetLastOpenedChannelFile';
import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { StateRepositoryMock } from '../../infrastructure/repositories/StateRepositoryMock';

let stateRepository: StateRepositoryMock;
let useCase: GetLastOpenedChannelFile;

describe('GetLastOpenedChannelFile', () => {
  beforeEach(() => {
    stateRepository = new StateRepositoryMock();
    useCase = new GetLastOpenedChannelFile(stateRepository);
  });

  it('returns null when there is no stored last opened file', async () => {
    const result = await useCase.run();

    expect(result).toBeNull();
    stateRepository.expectGetLastOpenedChannelFileCalledTimes(1);
  });

  it('returns the last opened channel file with its parsed content', async () => {
    const expectedChannelFile = ChannelFile.fromPrimitives(ChannelFilePrimitiveMother.random());

    stateRepository.setLastOpenedFile(expectedChannelFile);

    const result = await useCase.run();

    stateRepository.expectGetLastOpenedChannelFileCalledTimes(1);
    expect(result).toEqual(expectedChannelFile.toPrimitives());
  });
});
