import { readFileUtf8 } from '@main/files/fileService';
import { setLastOpenedFilePath } from '@main/state/appState';

export async function openByPathController(path: string): Promise<void> {
  try {
    await readFileUtf8(path);
  } catch {
    return;
  }

  await setLastOpenedFilePath(path);
}
