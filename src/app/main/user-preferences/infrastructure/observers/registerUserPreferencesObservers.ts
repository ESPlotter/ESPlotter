import { app } from 'electron';

import { webContentsBroadcast } from '@main/shared/infrastructure/ipc/webContentsBroadcast';

import { ElectronStoreUserPreferencesRepository } from '../repositories/ElectronStoreUserPreferencesRepository';

export async function registerUserPreferencesObservers(): Promise<void> {
  const repository = new ElectronStoreUserPreferencesRepository();

  const unsubscribePalette = repository.onChangeChartSeriesPalette((updatedPreferences) => {
    webContentsBroadcast('userPreferencesChanged', updatedPreferences.toPrimitives());
  });

  const unsubscribeDyntools = repository.onChangeDyntoolsPath((updatedPreferences) => {
    webContentsBroadcast('userPreferencesChanged', updatedPreferences.toPrimitives());
  });

  const unsubscribePython = repository.onChangePythonPath((updatedPreferences) => {
    webContentsBroadcast('userPreferencesChanged', updatedPreferences.toPrimitives());
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
