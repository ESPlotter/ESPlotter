import { ipcRenderer } from 'electron';
import type { IpcChannelKey, IpcInvokeArgs, IpcInvokeResult } from '@shared/ipc/IPCContracts';

export function ipcRendererInvoke<TChannel extends IpcChannelKey>(
  channel: TChannel,
  ...args: IpcInvokeArgs<TChannel>
): IpcInvokeResult<TChannel> {
  return ipcRenderer.invoke(channel, ...args) as IpcInvokeResult<TChannel>;
}
