import { ipcMain } from 'electron';
import type {
  IpcChannelKey,
  IpcInvokeArgs,
  IpcInvokeHandler,
} from '../../../types/ipc-contracts';

export function ipcMainHandle<TChannel extends IpcChannelKey>(
  channel: TChannel,
  handler: IpcInvokeHandler<TChannel>,
) {
  ipcMain.handle(channel, async (_event, ...args) =>
    handler(...(args as IpcInvokeArgs<TChannel>)),
  );
};

