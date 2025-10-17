import { ipcMain } from 'electron';
import {
  IpcChannelKey,
  IpcInvokeArgs,
  IpcInvokeHandler,
} from '@shared/Domain/Repositories/IPCContracts';

export function ipcMainHandle<TChannel extends IpcChannelKey>(
  channel: TChannel,
  handler: IpcInvokeHandler<TChannel>,
) {
  ipcMain.handle(channel, async (_event, ...args) => handler(...(args as IpcInvokeArgs<TChannel>)));
}
