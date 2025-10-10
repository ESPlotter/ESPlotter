import { readFileUtf8 } from '@main/files/fileService';
import { removeFromRecentFiles, setLastOpenedFilePath } from '@main/state/appState';
import { webContentsBroadcast } from '@main/ipc/webContentsSend';

export async function openByPathController(path: string): Promise<void> {
  try {
    await readFileUtf8(path);
  } catch (err) {
    // Remove from recents and notify UI
    await removeFromRecentFiles(path);
    const reason = (err as NodeJS.ErrnoException)?.code === 'ENOENT' ? 'not_found' : 'unreadable';
    webContentsBroadcast('fileOpenFailed', {
      path,
      reason,
      message: (err as Error)?.message,
    });
    return;
  }

  await setLastOpenedFilePath(path);
}

