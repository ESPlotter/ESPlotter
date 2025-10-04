// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridgeExposeInMainWorld } from './ipc/contextBridgeExposeInMainWorld';
import { ipcRendererInvoke } from './ipc/ipcRendererInvoke';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRendererInvoke('ping'),
});
