import { BrowserWindow } from 'electron';

import { type IpcEventKey, type IpcEventPayload } from '@shared/Domain/Repositories/IPCContracts';

export function webContentsBroadcast<TKey extends IpcEventKey>(
  channel: TKey,
  payload: IpcEventPayload<TKey>,
): void {
  for (const win of BrowserWindow.getAllWindows()) {
    try {
      win.webContents.send(channel, payload);
    } catch {
      // ignore windows that might be closing
    }
  }
}
