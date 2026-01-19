import type { ElectronApplication } from '@playwright/test';

export interface ClipboardImageSize {
  width: number;
  height: number;
}

export async function readClipboardImageDataUrl(app: ElectronApplication): Promise<string> {
  return app.evaluate(({ clipboard }) => {
    const image = clipboard.readImage();
    return image.isEmpty() ? '' : image.toDataURL();
  });
}

export async function readClipboardImageSize(
  app: ElectronApplication,
): Promise<ClipboardImageSize | null> {
  return app.evaluate(({ clipboard }) => {
    const image = clipboard.readImage();
    if (image.isEmpty()) {
      return null;
    }
    const size = image.getSize();
    return { width: size.width, height: size.height };
  });
}

export async function clearClipboardImage(app: ElectronApplication): Promise<void> {
  await app.evaluate(({ clipboard }) => {
    clipboard.clear();
  });
}
