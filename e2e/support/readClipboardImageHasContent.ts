import type { ElectronApplication } from '@playwright/test';

export async function readClipboardImageHasContent(app: ElectronApplication): Promise<boolean> {
  return app.evaluate(({ clipboard }) => {
    const image = clipboard.readImage();
    if (image.isEmpty()) {
      return false;
    }

    const size = image.getSize();
    if (size.width === 0 || size.height === 0) {
      return false;
    }

    const bitmap = image.toBitmap();
    if (bitmap.length < 4) {
      return false;
    }

    const baseRed = bitmap[0];
    const baseGreen = bitmap[1];
    const baseBlue = bitmap[2];
    const baseAlpha = bitmap[3];

    for (let index = 4; index < bitmap.length; index += 4) {
      if (
        bitmap[index] !== baseRed ||
        bitmap[index + 1] !== baseGreen ||
        bitmap[index + 2] !== baseBlue ||
        bitmap[index + 3] !== baseAlpha
      ) {
        return true;
      }
    }

    return false;
  });
}
