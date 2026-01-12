// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridgeExposeInMainWorld } from '@preload/ipc/contextBridgeExposeInMainWorld';
import { ipcRendererInvoke } from '@preload/ipc/ipcRendererInvoke';
import { ipcRendererOn } from '@preload/ipc/ipcRendererOn';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';
import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridgeExposeInMainWorld('files', {
  onChannelFileOpened: (listener: (file: ChannelFilePrimitive) => void) =>
    ipcRendererOn('channelFileOpened', listener),
});

contextBridgeExposeInMainWorld('userPreferences', {
  getChartSeriesPalette: () => ipcRendererInvoke('getChartSeriesPalette'),
  updateChartSeriesPalette: (colors: string[]) =>
    ipcRendererInvoke('updateChartSeriesPalette', colors),
  getDyntoolsPath: () => ipcRendererInvoke('getDyntoolsPath'),
  updateDyntoolsPath: (path: string) => ipcRendererInvoke('updateDyntoolsPath', path),
  selectDyntoolsPath: () => ipcRendererInvoke('selectDyntoolsPath'),
  getPythonPath: () => ipcRendererInvoke('getPythonPath'),
  updatePythonPath: (path: string) => ipcRendererInvoke('updatePythonPath', path),
  selectPythonPath: () => ipcRendererInvoke('selectPythonPath'),
  onChangedChartSeriesPalette: (listener: (preferences: UserPreferencesPrimitive) => void) =>
    ipcRendererOn('userPreferencesChanged', listener),
  onOpenRequested: (listener: () => void) =>
    ipcRendererOn('userPreferencesOpenRequested', listener),
});
