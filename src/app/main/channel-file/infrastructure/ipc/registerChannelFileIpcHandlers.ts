import { ipcMainHandle } from '@main/shared/ipc/ipcMainHandle';

export function registerChannelFileIpcHandlers(): void {
  ipcMainHandle('getLastOpenedFile', async () => {
    const getLastOpenedChannelFile = new (
      await import('@main/channel-file/application/use-cases/GetLastOpenedChannelFile')
    ).GetLastOpenedChannelFile(
      new (
        await import('@main/channel-file/infrastructure/repositories/ElectronStoreStateRepository')
      ).ElectronStoreStateRepository(),
      new (
        await import('@main/channel-file/infrastructure/services/NodeFileService')
      ).NodeFileService(),
    );
    return getLastOpenedChannelFile.run();
  });
  ipcMainHandle('getOpenedChannelFiles', async () => {
    const getOpenedChannelFiles = new (
      await import('@main/channel-file/application/use-cases/GetOpenedChannelFiles')
    ).GetOpenedChannelFiles(
      new (
        await import('@main/channel-file/infrastructure/repositories/ElectronStoreStateRepository')
      ).ElectronStoreStateRepository(),
      new (
        await import('@main/channel-file/infrastructure/services/NodeFileService')
      ).NodeFileService(),
    );
    return getOpenedChannelFiles.run();
  });
}
