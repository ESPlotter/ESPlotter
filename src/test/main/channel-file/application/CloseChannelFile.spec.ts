import { beforeEach, describe, it } from 'vitest';

import { CloseChannelFile } from '@main/channel-file/application/use-cases/CloseChannelFile';

import { ChannelFileRepositoryMock } from '../infrastructure/repositories/ChannelFileRepositoryMock';

describe('CloseChannelFile', () => {
  let repository: ChannelFileRepositoryMock;
  let useCase: CloseChannelFile;

  beforeEach(() => {
    repository = new ChannelFileRepositoryMock();
    useCase = new CloseChannelFile(repository);
  });

  it('removes the cached file', async () => {
    const path = '/path/to/file.csv';

    await useCase.run(path);

    repository.expectRemoveCalledTimes(1);
    repository.expectLastRemovedPath(path);
  });
});
