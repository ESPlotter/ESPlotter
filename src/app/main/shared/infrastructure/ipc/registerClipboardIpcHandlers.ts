import { clipboard, nativeImage } from 'electron';

import { ipcMainHandle } from './ipcMainHandle';

export function registerClipboardIpcHandlers(): void {
  ipcMainHandle('writeClipboardImage', async (dataUrl: string) => {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);
  });
}
