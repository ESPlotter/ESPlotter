import { contextBridge, ipcRenderer } from 'electron';
import type {
  IpcChannelKey,
  IpcInvokeArgs,
  IpcInvokeResult,
  RendererExposure,
  RendererExposureKey,
} from '../../../../types/ipc-contracts';

export function contextBridgeExposeInMainWorld<TName extends RendererExposureKey>(
  key: TName,
  api: RendererExposure<TName>,
) {
  contextBridge.exposeInMainWorld(key, api);
};

export function ipcRendererInvoke<TChannel extends IpcChannelKey>(
  channel: TChannel,
  ...args: IpcInvokeArgs<TChannel>
): IpcInvokeResult<TChannel> {
  return ipcRenderer.invoke(channel, ...args) as IpcInvokeResult<TChannel>;
};
