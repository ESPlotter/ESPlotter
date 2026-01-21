import { expect, type ElectronApplication } from '@playwright/test';

interface ClipboardImageSize {
  width: number;
  height: number;
}

export class ClipboardTestObject {
  constructor(private readonly app: ElectronApplication) {}

  async readImageDataUrl(): Promise<string> {
    return this.app.evaluate(({ clipboard }) => {
      const image = clipboard.readImage();
      return image.isEmpty() ? '' : image.toDataURL();
    });
  }

  async readImageSize(): Promise<ClipboardImageSize | null> {
    return this.app.evaluate(({ clipboard }) => {
      const image = clipboard.readImage();
      if (image.isEmpty()) {
        return null;
      }
      const size = image.getSize();
      return { width: size.width, height: size.height };
    });
  }

  async clearImage(): Promise<void> {
    await this.app.evaluate(({ clipboard }) => {
      clipboard.clear();
    });
  }

  async hasImageContent(): Promise<boolean> {
    return this.app.evaluate(({ clipboard }) => {
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

  async expectImageDataUrl(): Promise<void> {
    await expect
      .poll(async () => this.readImageDataUrl(), { timeout: 10000 })
      .toMatch(/^data:image\/png;base64/);
  }

  async expectImageHasContent(): Promise<void> {
    await expect.poll(async () => this.hasImageContent(), { timeout: 10000 }).toBe(true);
  }

  async expectImageEmpty(timeout = 2000): Promise<void> {
    await expect.poll(async () => this.readImageSize(), { timeout }).toBeNull();
  }

  async expectImageSize(expectedSize: ClipboardImageSize): Promise<void> {
    await expect.poll(async () => this.readImageSize(), { timeout: 10000 }).toEqual(expectedSize);
  }
}
