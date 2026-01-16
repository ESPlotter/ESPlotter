import { ipcMainHandle } from '@main/shared/infrastructure/ipc/ipcMainHandle';

import { ElectronStoreUserPreferencesRepository } from '../repositories/ElectronStoreUserPreferencesRepository';

export function registerUserPreferencesIpcHandlers(): void {
  ipcMainHandle('getChartSeriesPalette', async () => {
    const repository = createRepository();
    const getUserPreferences = new (
      await import('@main/user-preferences/application/use-cases/GetUserPreferences')
    ).GetUserPreferences(repository);
    const preferences = await getUserPreferences.run();
    return preferences.chartSeriesPalette;
  });

  ipcMainHandle('updateChartSeriesPalette', async (colors: string[]) => {
    const repository = createRepository();
    const updateChartSeriesPalette = new (
      await import('@main/user-preferences/application/use-cases/UpdateChartSeriesPalette')
    ).UpdateChartSeriesPalette(repository);
    return updateChartSeriesPalette.run(colors);
  });

  ipcMainHandle('getDyntoolsPath', async () => {
    const repository = createRepository();
    const getUserPreferences = new (
      await import('@main/user-preferences/application/use-cases/GetUserPreferences')
    ).GetUserPreferences(repository);
    const preferences = await getUserPreferences.run();
    return preferences.general.paths.dyntoolsPath;
  });

  ipcMainHandle('updateDyntoolsPath', async (path: string) => {
    const repository = createRepository();
    const updateDyntoolsPath = new (
      await import('@main/user-preferences/application/use-cases/UpdateDyntoolsPath')
    ).UpdateDyntoolsPath(repository);
    return updateDyntoolsPath.run(path);
  });

  ipcMainHandle('selectDyntoolsPath', async () => {
    const { dialog, BrowserWindow } = await import('electron');
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
      return null;
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
    if (canceled) {
      return null;
    }
    return filePaths[0] ?? null;
  });

  ipcMainHandle('getPythonPath', async () => {
    const repository = createRepository();
    const getUserPreferences = new (
      await import('@main/user-preferences/application/use-cases/GetUserPreferences')
    ).GetUserPreferences(repository);
    const preferences = await getUserPreferences.run();
    return preferences.general.paths.pythonPath;
  });

  ipcMainHandle('updatePythonPath', async (path: string) => {
    const repository = createRepository();
    const updatePythonPath = new (
      await import('@main/user-preferences/application/use-cases/UpdatePythonPath')
    ).UpdatePythonPath(repository);
    return updatePythonPath.run(path);
  });

  ipcMainHandle('selectPythonPath', async () => {
    const { dialog, BrowserWindow } = await import('electron');
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
      return null;
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
    });
    if (canceled) {
      return null;
    }
    return filePaths[0] ?? null;
  });
}

function createRepository(): ElectronStoreUserPreferencesRepository {
  return new ElectronStoreUserPreferencesRepository();
}
