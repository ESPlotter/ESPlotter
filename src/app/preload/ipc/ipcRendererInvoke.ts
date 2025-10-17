import { ipcRenderer } from 'electron';

import {
  IpcChannelKey,
  IpcInvokeArgs,
  IpcInvokeResult,
} from '@shared/domain/repositories/IPCContracts';

export function ipcRendererInvoke<TChannel extends IpcChannelKey>(
  channel: TChannel,
  ...args: IpcInvokeArgs<TChannel>
): IpcInvokeResult<TChannel> {
  return ipcRenderer.invoke(channel, ...args) as IpcInvokeResult<TChannel>;
}
