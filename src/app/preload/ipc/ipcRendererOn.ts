import { ipcRenderer } from 'electron';

import { IpcEventKey, IpcEventListener } from '@shared/domain/repositories/IPCContracts';

export function ipcRendererOn<TKey extends IpcEventKey>(
  channel: TKey,
  listener: IpcEventListener<TKey>,
): () => void {
  const wrapped = (_event: Electron.IpcRendererEvent, payload: unknown) => {
    listener(payload as Parameters<IpcEventListener<TKey>>[0]);
  };
  ipcRenderer.on(channel, wrapped);
  return () => {
    ipcRenderer.off(channel, wrapped);
  };
}
