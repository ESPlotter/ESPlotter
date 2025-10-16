import { app } from 'electron';
import { webContentsBroadcast } from '@main/ipc/webContentsSend';

export async function registerAppStateObservers() {
  const stateRepository = new (
    await import('@main/state/ElectronStoreStateRepository')
  ).ElectronStoreStateRepository();

  const offLast = stateRepository.onLastOpenedFilePathChange(async (newPath) => {
    if (!newPath) {
      return;
    }

    const file = await stateRepository.getLastOpenedFile();
    if (!file) {
      return;
    }

    webContentsBroadcast('lastOpenedFileParsedChanged', file);
  });

  app.on('will-quit', () => {
    try {
      offLast();
    } catch {}
  });
}
