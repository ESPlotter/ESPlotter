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
  const wrapped = (_event: Electron.IpcRendererEvent, payload: unknown) => {
    if (listener.length === 0) {
      (listener as () => void)();
      return;
    }
    (listener as (arg: IpcEventPayload<TKey>) => void)(payload as IpcEventPayload<TKey>);
  };
  ipcRenderer.on(channel, wrapped);
  return () => {
    ipcRenderer.off(channel, wrapped);
  };
}
