// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridgeExposeInMainWorld } from '@preload/ipc/contextBridgeExposeInMainWorld';
import { ipcRendererInvoke } from '@preload/ipc/ipcRendererInvoke';
import { ipcRendererOn } from '@preload/ipc/ipcRendererOn';
import type { AllowedFileStructure } from '@shared/AllowedFileStructure';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRendererInvoke('ping'),
});

contextBridgeExposeInMainWorld('uniplot', {
  getChartData: () => ipcRendererInvoke('getChartData'),
  saveNewFile: (fileData: { name: string; content: string }) =>
    ipcRendererInvoke('saveNewFile', fileData),
});

contextBridgeExposeInMainWorld('files', {
  getLastOpenedFilePath: () => ipcRendererInvoke('getLastOpenedFilePath'),
  getLastOpenedFile: () => ipcRendererInvoke('getLastOpenedFile'),
  getLastOpenedFiles: () => ipcRendererInvoke('getLastOpenedFiles'),
  readFile: (path: string) => ipcRendererInvoke('readFile', path),
  openByPath: (path: string) => ipcRendererInvoke('openByPath', path),
  onFileOpenFailed: (
    listener: (payload: {
      path: string;
      reason: 'not_found' | 'unreadable' | 'invalid_json' | 'invalid_format' | 'unknown';
      message?: string;
    }) => void,
  ) => ipcRendererOn('fileOpenFailed', listener),
  onLastOpenedFileParsedChanged: (
    listener: (file: { path: string; data: AllowedFileStructure }) => void,
  ) => ipcRendererOn('lastOpenedFileParsedChanged', listener),
});
