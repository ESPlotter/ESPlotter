import { registerUserPreferencesIpcHandlers } from '@main/user-preferences/infrastructure/ipc/registerUserPreferencesIpcHandlers';

export function registerMainIpcHandlers(): void {
  registerUserPreferencesIpcHandlers();
}
