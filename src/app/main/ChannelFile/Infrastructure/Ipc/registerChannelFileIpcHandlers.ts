import { ipcMainHandle } from '@main/Shared/ipc/ipcMainHandle';

export function registerChannelFileIpcHandlers(): void {
  ipcMainHandle('getLastOpenedFile', async () => {
    const getLastOpenedChannelFile = new (
      await import('@main/ChannelFile/Application/UseCases/GetLastOpenedChannelFile')
    ).GetLastOpenedChannelFile(
      new (
        await import('@main/ChannelFile/Infrastructure/Repositories/ElectronStoreStateRepository')
      ).ElectronStoreStateRepository(),
      new (
        await import('@main/ChannelFile/Infrastructure/Services/NodeFileService')
      ).NodeFileService(),
    );
    return getLastOpenedChannelFile.run();
  });
  ipcMainHandle('getOpenedChannelFiles', async () => {
    const getOpenedChannelFiles = new (
      await import('@main/ChannelFile/Application/UseCases/GetOpenedChannelFiles')
    ).GetOpenedChannelFiles(
      new (
        await import('@main/ChannelFile/Infrastructure/Repositories/ElectronStoreStateRepository')
      ).ElectronStoreStateRepository(),
      new (
        await import('@main/ChannelFile/Infrastructure/Services/NodeFileService')
      ).NodeFileService(),
    );
    return getOpenedChannelFiles.run();
  });
}
