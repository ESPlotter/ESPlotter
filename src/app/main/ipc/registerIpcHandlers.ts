import { ipcMainHandle } from '@main/ipc/ipcMainHandle';
import { getChartData } from '@main/getChartData/GetChartData';
import { getLastOpenedFile, getLastOpenedFilePath } from '@main/state/appState';
import { openByPathController } from '@main/controllers/fileOpenController';
import { readAllowedFile } from '@main/files/fileService';
import { saveToAppData } from '@main/files/saveToAppData';

export function registerIpcHandlers() {
  ipcMainHandle('ping', () => 'pong');
  ipcMainHandle('getChartData', getChartData);
  ipcMainHandle('saveNewFile', async (fileData: { name: string; content: string }) => {
    await saveToAppData(fileData);
  });
  ipcMainHandle('getLastOpenedFilePath', getLastOpenedFilePath);
  ipcMainHandle('getLastOpenedFile', getLastOpenedFile);
  ipcMainHandle('readFile', readAllowedFile);
  ipcMainHandle('openByPath', openByPathController);
}
