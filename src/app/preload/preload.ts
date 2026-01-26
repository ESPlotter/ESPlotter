// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridgeExposeInMainWorld } from '@preload/ipc/contextBridgeExposeInMainWorld';
import { ipcRendererInvoke } from '@preload/ipc/ipcRendererInvoke';
import { ipcRendererOn } from '@preload/ipc/ipcRendererOn';
import { type ChannelFileOpenStatusPrimitive } from '@shared/domain/primitives/ChannelFileOpenStatusPrimitive';
import { type ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridgeExposeInMainWorld('files', {
  onChannelFileOpenStarted: (listener: (payload: ChannelFileOpenStatusPrimitive) => void) =>
    ipcRendererOn('channelFileOpenStarted', listener),
  onChannelFileOpenFailed: (listener: (payload: ChannelFileOpenStatusPrimitive) => void) =>
    ipcRendererOn('channelFileOpenFailed', listener),
  onChannelFileOpened: (listener: (file: ChannelFilePreviewPrimitive) => void) =>
    ipcRendererOn('channelFileOpened', listener),
  getChannelFileSeries: (path: string, channelId: string) =>
    ipcRendererInvoke('getChannelFileSeries', path, channelId),
  closeChannelFile: (path: string) => ipcRendererInvoke('closeChannelFile', path),
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
  onChangedChartSeriesPalette: (listener: (colors: string[]) => void) =>
    ipcRendererOn('chartSeriesPaletteChanged', listener),
  onChangedDyntoolsPath: (listener: (path: string) => void) =>
    ipcRendererOn('dyntoolsPathChanged', listener),
  onChangedPythonPath: (listener: (path: string) => void) =>
    ipcRendererOn('pythonPathChanged', listener),
  onOpenRequested: (listener: () => void) =>
    ipcRendererOn('userPreferencesOpenRequested', listener),
});

contextBridgeExposeInMainWorld('clipboard', {
  writeImage: (dataUrl: string) => ipcRendererInvoke('writeClipboardImage', dataUrl),
});
