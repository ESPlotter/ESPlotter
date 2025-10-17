import { ipcMain } from 'electron';

import {
  type IpcChannelKey,
  type IpcInvokeArgs,
  type IpcInvokeHandler,
} from '@shared/Domain/Repositories/IPCContracts';

export function ipcMainHandle<TChannel extends IpcChannelKey>(
  channel: TChannel,
  handler: IpcInvokeHandler<TChannel>,
) {
  ipcMain.handle(channel, async (_event, ...args) => handler(...(args as IpcInvokeArgs<TChannel>)));
}
