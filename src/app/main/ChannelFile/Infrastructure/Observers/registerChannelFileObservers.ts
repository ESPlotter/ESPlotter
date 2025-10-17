import { app } from 'electron';

import { webContentsBroadcast } from '@main/Shared/ipc/webContentsBroadcast';

export async function registerChannelFileObservers(): Promise<void> {
  const stateRepository = new (
    await import('@main/ChannelFile/Infrastructure/Repositories/ElectronStoreStateRepository')
  ).ElectronStoreStateRepository();
  const getLastOpenedChannelFile = new (
    await import('@main/ChannelFile/Application/UseCases/GetLastOpenedChannelFile')
  ).GetLastOpenedChannelFile(
    stateRepository,
    new (
      await import('@main/ChannelFile/Infrastructure/Services/NodeFileService')
    ).NodeFileService(),
  );

  const offLast = stateRepository.onLastOpenedFilePathChange(async () => {
    const file = await getLastOpenedChannelFile.run();
    if (!file) {
      return;
    }

    webContentsBroadcast('lastOpenedFileChanged', file);
  });

  app.on('will-quit', () => {
    try {
      offLast();
    } catch {}
  });
}
