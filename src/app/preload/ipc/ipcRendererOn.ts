import { ipcRenderer } from 'electron';

import {
  type IpcEventKey,
  type IpcEventListener,
  type IpcEventPayload,
} from '@shared/domain/repositories/IPCContracts';

export function ipcRendererOn<TKey extends IpcEventKey>(
  channel: TKey,
  listener: IpcEventListener<TKey>,
): () => void {
  const handler = (_event: Electron.IpcRendererEvent, value: IpcEventPayload<TKey>) => {
    listener(value);
  };

  ipcRenderer.on(channel, handler);
  return () => {
    ipcRenderer.off(channel, handler);
  };
}
