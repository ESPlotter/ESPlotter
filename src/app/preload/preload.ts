// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridgeExposeInMainWorld } from '@preload/ipc/contextBridgeExposeInMainWorld';
import { ipcRendererOn } from '@preload/ipc/ipcRendererOn';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridgeExposeInMainWorld('files', {
  onChannelFileOpened: (listener: (file: ChannelFilePrimitive) => void) =>
    ipcRendererOn('channelFileOpened', listener),
});
