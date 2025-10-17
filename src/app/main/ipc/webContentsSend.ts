import { BrowserWindow } from 'electron';
import { IpcEventKey, IpcEventPayload } from '@shared/Domain/Repositories/IPCContracts';

export function webContentsSend<TKey extends IpcEventKey>(
  win: BrowserWindow,
  channel: TKey,
  payload: IpcEventPayload<TKey>,
): void {
  win.webContents.send(channel, payload);
}
