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

  ipcMainHandle('getDataTableFormat', async () => {
    const repository = createRepository();
    const getDataTableFormat = new (
      await import('@main/user-preferences/application/use-cases/GetDataTableFormat')
    ).GetDataTableFormat(repository);
    return getDataTableFormat.execute();
  });

  ipcMainHandle('updateDataTableFormat', async (decimals: number, fixed: boolean) => {
    const repository = createRepository();
    const updateDataTableFormat = new (
      await import('@main/user-preferences/application/use-cases/UpdateDataTableFormat')
    ).UpdateDataTableFormat(repository);
    return updateDataTableFormat.execute(decimals, fixed);
  });
}

function createRepository(): ElectronStoreUserPreferencesRepository {
  return new ElectronStoreUserPreferencesRepository();
}
