import { ipcRenderer } from 'electron';

import { type IpcEventKey, type IpcEventListener } from '@shared/domain/repositories/IPCContracts';

export function ipcRendererOn<TKey extends IpcEventKey>(
  channel: TKey,
  listener: IpcEventListener<TKey>,
): () => void {
  ipcRenderer.on(channel, (_event, value) => listener(value));
  return () => {
    ipcRenderer.off(channel, (_event, value) => listener(value));
  };
}
