import { app } from 'electron';
import {
  getLastOpenedFile,
  onLastOpenedFilePathChange,
  onRecentFilesChange,
} from '@main/state/appState';
import { webContentsBroadcast } from '@main/ipc/webContentsSend';

export function registerAppStateObservers() {
  // When the last opened file path changes, broadcast the loaded file to all windows.
  const offLast = onLastOpenedFilePathChange(async (newPath) => {
    if (!newPath) return;
    const file = await getLastOpenedFile();
    if (file) webContentsBroadcast('lastOpenedFileChanged', file);
  });

  const offRecents = onRecentFilesChange((paths) => {
    webContentsBroadcast('recentFilesChanged', paths);
  });

  app.on('will-quit', () => {
    try {
      offLast();
    } catch {}

    try {
      offRecents();
    } catch {}
  });
}
