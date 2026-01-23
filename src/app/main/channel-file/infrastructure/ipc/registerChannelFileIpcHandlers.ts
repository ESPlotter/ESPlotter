import { CloseChannelFile } from '@main/channel-file/application/use-cases/CloseChannelFile';
import { GetChannelFileSeries } from '@main/channel-file/application/use-cases/GetChannelFileSeries';
import { channelFileRepository } from '@main/channel-file/infrastructure/repositories/channelFileRepository';
import { ipcMainHandle } from '@main/shared/infrastructure/ipc/ipcMainHandle';

export function registerChannelFileIpcHandlers(): void {
  ipcMainHandle('getChannelFileSeries', async (path: string, channelId: string) => {
    const getChannelFileSeries = new GetChannelFileSeries(channelFileRepository);
    return getChannelFileSeries.run(path, channelId);
  });

  ipcMainHandle('closeChannelFile', async (path: string) => {
    const closeChannelFile = new CloseChannelFile(channelFileRepository);
    await closeChannelFile.run(path);
  });
}
