import { app } from 'electron';

import { webContentsBroadcast } from '@main/shared/ipc/webContentsBroadcast';

import { ElectronStoreUserPreferencesRepository } from '../repositories/ElectronStoreUserPreferencesRepository';

export async function registerUserPreferencesObservers(): Promise<void> {
  const repository = new ElectronStoreUserPreferencesRepository();

  const unsubscribe = repository.onChangeChartSeriesPalette((updatedPreferences) => {
    webContentsBroadcast('userPreferencesChanged', updatedPreferences.toPrimitives());
  });

  app.on('will-quit', () => {
    try {
      unsubscribe();
    } catch {}
  });
}
