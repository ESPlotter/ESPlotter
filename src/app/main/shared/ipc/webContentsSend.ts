import { BrowserWindow } from 'electron';

import { type IpcEventKey, type IpcEventPayload } from '@shared/domain/repositories/IPCContracts';

export function webContentsSend<TKey extends IpcEventKey>(
  win: BrowserWindow,
  channel: TKey,
  payload: IpcEventPayload<TKey>,
): void {
  win.webContents.send(channel, payload);
}
