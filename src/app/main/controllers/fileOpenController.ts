import { readFileUtf8 } from '@main/files/fileService';
import { setLastOpenedFilePath, clearLastOpenedFilePath } from '@main/state/appState';
import { webContentsBroadcast } from '@main/ipc/webContentsSend';
import { parseAllowedFileStructure } from '@shared/AllowedFileStructure';

export async function openByPathController(path: string): Promise<void> {
  let content: string;
  try {
    content = await readFileUtf8(path);
  } catch (e: any) {
    const reason = e?.code === 'ENOENT' ? 'not_found' : 'unreadable';
    webContentsBroadcast('fileOpenFailed', { path, reason, message: e?.message });
    return;
  }

  try {
    // Validate structure before accepting the file
    parseAllowedFileStructure(content);
  } catch (e: any) {
    const reason = e?.message === 'invalid_json' ? 'invalid_json' : 'invalid_format';
    webContentsBroadcast('fileOpenFailed', { path, reason, message: e?.message });
    await clearLastOpenedFilePath();
    return;
  }

  await setLastOpenedFilePath(path);
}
