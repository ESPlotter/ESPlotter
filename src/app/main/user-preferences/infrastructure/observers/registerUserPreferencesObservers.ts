import { app } from 'electron';

import { webContentsBroadcast } from '@main/shared/infrastructure/ipc/webContentsBroadcast';

import { ElectronStoreUserPreferencesRepository } from '../repositories/ElectronStoreUserPreferencesRepository';

export async function registerUserPreferencesObservers(): Promise<void> {
  const repository = new ElectronStoreUserPreferencesRepository();

  const unsubscribePalette = repository.onChangeChartSeriesPalette((updatedPreferences) => {
    const primitives = updatedPreferences.toPrimitives();
    webContentsBroadcast('chartSeriesPaletteChanged', primitives.chartSeriesPalette);
  });

  const unsubscribeDyntools = repository.onChangeDyntoolsPath((updatedPreferences) => {
    const primitives = updatedPreferences.toPrimitives();
    webContentsBroadcast('dyntoolsPathChanged', primitives.general.paths.dyntoolsPath);
  });

  const unsubscribePython = repository.onChangePythonPath((updatedPreferences) => {
    const primitives = updatedPreferences.toPrimitives();
    webContentsBroadcast('pythonPathChanged', primitives.general.paths.pythonPath);
  });

  app.on('will-quit', () => {
    try {
      unsubscribePalette();
    } catch {}

    try {
      unsubscribeDyntools();
    } catch {}

    try {
      unsubscribePython();
    } catch {}
  });
}
