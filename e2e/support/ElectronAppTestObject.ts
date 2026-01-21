import { expect, type ElectronApplication, type Page } from '@playwright/test';

interface WindowBounds {
  width: number;
  height: number;
}

interface VersionsApi {
  node: () => string;
}

export class ElectronAppTestObject {
  constructor(
    private readonly app: ElectronApplication,
    private readonly page: Page,
  ) {}

  async expectAppName(expectedName: string): Promise<void> {
    const name = await this.app.evaluate((electron) => electron.app.getName());
    expect(name).toBe(expectedName);
  }

  async expectWindowHasSize(): Promise<void> {
    const windowSize = await this.page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    expect(windowSize.width).toBeGreaterThan(0);
    expect(windowSize.height).toBeGreaterThan(0);
  }

  async expectWindowResizesTo(width: number, height: number): Promise<void> {
    const initialBounds = await this.getWindowBounds();
    const heightTolerance = process.platform === 'darwin' ? 32 : 10;

    await this.setWindowSize(width, height);

    const newBounds = await this.getWindowBounds();

    expect(newBounds.width).toBe(width);
    expect(newBounds.height).toBeGreaterThanOrEqual(height - heightTolerance);
    expect(newBounds.height).toBeLessThanOrEqual(height + heightTolerance);
    expect(newBounds.width).not.toBe(initialBounds.width);
    expect(newBounds.height).not.toBe(initialBounds.height);
  }

  async expectPreloadVersionsAvailable(): Promise<void> {
    const nodeVersion = await this.page.evaluate(() => {
      const versions = window.versions as VersionsApi;
      return versions.node();
    });

    expect(typeof nodeVersion).toBe('string');
  }

  async expectMainUiVisible(): Promise<void> {
    await expect(this.page.getByText('CHANNELS')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'New Chart' })).toBeVisible();
  }

  private async getWindowBounds(): Promise<WindowBounds> {
    return this.app.evaluate((electron) => {
      const mainWindow = electron.BrowserWindow.getAllWindows()[0];
      return mainWindow.getBounds();
    });
  }

  private async setWindowSize(width: number, height: number): Promise<void> {
    await this.app.evaluate(
      async (electron, { newWidth, newHeight }) => {
        const mainWindow = electron.BrowserWindow.getAllWindows()[0];
        mainWindow.setSize(newWidth, newHeight);
      },
      { newWidth: width, newHeight: height },
    );
  }
}
