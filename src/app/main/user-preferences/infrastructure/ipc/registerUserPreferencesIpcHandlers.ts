import { ipcMainHandle } from '@main/shared/ipc/ipcMainHandle';

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
}

function createRepository(): ElectronStoreUserPreferencesRepository {
  return new ElectronStoreUserPreferencesRepository();
}
