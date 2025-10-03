// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import type {
  IpcChannelKey,
  IpcInvokeArgs,
  IpcInvokeResult,
  RendererExposure,
  RendererExposureKey,
} from '../../../types/ipc-contracts';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRendererInvoke('ping'),
});

function contextBridgeExposeInMainWorld<TName extends RendererExposureKey>(
  key: TName,
  api: RendererExposure<TName>,
) {
  contextBridge.exposeInMainWorld(key, api);
}

function ipcRendererInvoke<TChannel extends IpcChannelKey>(
  channel: TChannel,
  ...args: IpcInvokeArgs<TChannel>
): IpcInvokeResult<TChannel> {
  return ipcRenderer.invoke(channel, ...args) as IpcInvokeResult<TChannel>;
}