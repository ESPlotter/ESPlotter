import { readFileUtf8 } from '@main/files/fileService';
import { parseAllowedFileStructure } from '@shared/AllowedFileStructure';

export async function openByPathController(path: string): Promise<void> {
  const stateRepository = new (
    await import('@main/state/ElectronStoreStateRepository')
  ).ElectronStoreStateRepository();

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
    await stateRepository.clearLastOpenedFilePath();
    return;
  }

  await stateRepository.setLastOpenedFilePath(path);
}
