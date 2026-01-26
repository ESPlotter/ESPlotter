import { CloseChannelFile } from '@main/channel-file/application/use-cases/CloseChannelFile';
import { GetChannelFileSeries } from '@main/channel-file/application/use-cases/GetChannelFileSeries';
import { ipcMainHandle } from '@main/shared/infrastructure/ipc/ipcMainHandle';
import { ElectronStoreStateRepository } from '@shared/infrastructure/repositories/ElectronStoreStateRepository';

import { FileChannelFileRepository } from '../repositories/FileChannelFileRepository';

export function registerChannelFileIpcHandlers(): void {
  ipcMainHandle('getChannelFileSeries', async (path: string, channelId: string) => {
    const stateRepository = new ElectronStoreStateRepository();
    const channelFileRepository = new FileChannelFileRepository(stateRepository);
    const getChannelFileSeries = new GetChannelFileSeries(channelFileRepository);

    return getChannelFileSeries.run(path, channelId);
  });

  ipcMainHandle('closeChannelFile', async (path: string) => {
    const stateRepository = new ElectronStoreStateRepository();
    const channelFileRepository = new FileChannelFileRepository(stateRepository);
    const closeChannelFile = new CloseChannelFile(channelFileRepository);

    await closeChannelFile.run(path);
  });
}
