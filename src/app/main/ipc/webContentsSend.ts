import { BrowserWindow } from 'electron';
import type { IpcEventKey, IpcEventPayload } from '@shared/ipc/contracts';

/**
 * Typed wrapper to send events from main to a specific BrowserWindow.
 */
export function webContentsSend<TKey extends IpcEventKey>(
  win: BrowserWindow,
  channel: TKey,
  payload: IpcEventPayload<TKey>,
): void {
  win.webContents.send(channel, payload);
}

/** Broadcast to all open BrowserWindows */
export function webContentsBroadcast<TKey extends IpcEventKey>(
  channel: TKey,
  payload: IpcEventPayload<TKey>,
): void {
  for (const win of BrowserWindow.getAllWindows()) {
    try {
      win.webContents.send(channel, payload);
    } catch {
      // ignore windows that might be closing
    }
  }
}
