// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridgeExposeInMainWorld } from '@preload/ipc/contextBridgeExposeInMainWorld';
import { ipcRendererInvoke } from '@preload/ipc/ipcRendererInvoke';
import { ipcRendererOn } from '@preload/ipc/ipcRendererOn';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRendererInvoke('ping'),
});

contextBridgeExposeInMainWorld('uniplot', {
  getChartData: () => ipcRendererInvoke('getChartData'),
  saveNewFile: (fileData: { name: string; content: string }) => ipcRendererInvoke('saveNewFile', fileData),
});

contextBridgeExposeInMainWorld('files', {
  getLastOpenedFilePath: () => ipcRendererInvoke('getLastOpenedFilePath'),
  getLastOpenedFile: () => ipcRendererInvoke('getLastOpenedFile'),
  readFile: (path: string) => ipcRendererInvoke('readFile', path),
  getRecentFiles: () => ipcRendererInvoke('getRecentFiles'),
  openByPath: (path: string) => ipcRendererInvoke('openByPath', path),
  onRecentFilesChanged: (listener: (paths: string[]) => void) =>
    ipcRendererOn('recentFilesChanged', listener),
  onFileOpenFailed: (
    listener: (payload: { path: string; reason: 'not_found' | 'unreadable' | 'unknown'; message?: string }) => void,
  ) => ipcRendererOn('fileOpenFailed', listener),
  onLastOpenedFileChanged: (listener: (file: { path: string; content: string }) => void) =>
    ipcRendererOn('lastOpenedFileChanged', listener),
});
