import { ipcMainHandle } from '@main/ipc/ipcMainHandle';
import { readAllowedFile } from '@main/files/fileService';
import { saveToAppData } from '@main/files/saveToAppData';

export function registerIpcHandlers() {
  ipcMainHandle('ping', () => 'pong');
  ipcMainHandle('saveNewFile', async (fileData: { name: string; content: string }) => {
    await saveToAppData(fileData);
  });
  ipcMainHandle('getLastOpenedFile', async () => {
    const stateRepository = new (
      await import('@main/state/ElectronStoreStateRepository')
    ).ElectronStoreStateRepository();
    return stateRepository.getLastOpenedFile();
  });
  ipcMainHandle('getLastOpenedFiles', async () => {
    const stateRepository = new (
      await import('@main/state/ElectronStoreStateRepository')
    ).ElectronStoreStateRepository();
    return stateRepository.getLastOpenedFiles();
  });
  ipcMainHandle('readFile', readAllowedFile);
}
