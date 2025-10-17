import { app } from 'electron';

import { webContentsBroadcast } from '@main/shared/ipc/webContentsBroadcast';

export async function registerChannelFileObservers(): Promise<void> {
  const stateRepository = new (
    await import('@main/channel-file/infrastructure/repositories/ElectronStoreStateRepository')
  ).ElectronStoreStateRepository();
  const getLastOpenedChannelFile = new (
    await import('@main/channel-file/application/use-cases/GetLastOpenedChannelFile')
  ).GetLastOpenedChannelFile(
    stateRepository,
    new (
      await import('@main/channel-file/infrastructure/services/NodeFileService')
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
