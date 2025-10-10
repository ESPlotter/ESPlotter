import { app } from 'electron';
import { getLastOpenedFile, onLastOpenedFilePathChange } from '@main/state/appState';
import { webContentsBroadcast } from '@main/ipc/webContentsSend';

export function registerAppStateObservers() {
  const offLast = onLastOpenedFilePathChange(async (newPath) => {
    if (!newPath) {
      return;
    }

    const file = await getLastOpenedFile();
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
