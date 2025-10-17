import { webContentsBroadcast } from '@main/ipc/webContentsBroadcast';
import { app } from 'electron';

export async function registerAppStateObservers() {
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
