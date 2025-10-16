import { readFileUtf8 } from '@main/files/fileService';
import { setLastOpenedFilePath, clearLastOpenedFilePath } from '@main/state/appState';
import { parseAllowedFileStructure } from '@shared/AllowedFileStructure';

export async function openByPathController(path: string): Promise<void> {
  let content: string;
  try {
    content = await readFileUtf8(path);
  } catch {
    // File not found or unreadable
    return;
  }

  try {
    // Validate structure before accepting the file
    parseAllowedFileStructure(content);
  } catch {
    // Invalid format
    await clearLastOpenedFilePath();
    return;
  }

  await setLastOpenedFilePath(path);
}
