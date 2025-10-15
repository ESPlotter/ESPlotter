import { ipcMainHandle } from '@main/ipc/ipcMainHandle';
import { getChartData } from '@main/getChartData/GetChartData';
import { getLastOpenedFile, getLastOpenedFilesPath, getLastOpenedFiles } from '@main/state/appState';
import { readAllowedFile } from '@main/files/fileService';
import { saveToAppData } from '@main/files/saveToAppData';

export function registerIpcHandlers() {
  ipcMainHandle('ping', () => 'pong');
  ipcMainHandle('getChartData', getChartData);
  ipcMainHandle('saveNewFile', async (fileData: { name: string; content: string }) => {
    await saveToAppData(fileData);
  });
  ipcMainHandle('getLastOpenedFilesPath', getLastOpenedFilesPath);
  ipcMainHandle('getLastOpenedFile', getLastOpenedFile);
  ipcMainHandle('getLastOpenedFiles',getLastOpenedFiles)
  ipcMainHandle('readFile', readAllowedFile);
}
