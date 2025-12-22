import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Electron App', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('should launch electron app', async () => {
    const name = await electronApp.evaluate((electron) => electron.app.getName());

    expect(name).toBe('esplotter');
  });

  test('should have proper window dimensions', async () => {
    const windowSize = await mainPage.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    expect(windowSize.width).toBeGreaterThan(0);
    expect(windowSize.height).toBeGreaterThan(0);
  });

  test('should be able to resize window', async () => {
    const initialBounds = await electronApp.evaluate((electron) => {
      const mainWindow = electron.BrowserWindow.getAllWindows()[0];
      return mainWindow.getBounds();
    });

    const targetWidth = 600;
    const targetHeight = 700;
    // setSize behaves differently depending on the platform: on macOS, the window ends up a few pixels shorter than requested (system window frames cut ~16 px)
    const heightTolerance = process.platform === 'darwin' ? 32 : 10;

    await electronApp.evaluate(
      async (electron, { width, height }) => {
        const mainWindow = electron.BrowserWindow.getAllWindows()[0];
        mainWindow.setSize(width, height);
      },
      { width: targetWidth, height: targetHeight },
    );

    const newBounds = await electronApp.evaluate((electron) => {
      const mainWindow = electron.BrowserWindow.getAllWindows()[0];
      return mainWindow.getBounds();
    });

    expect(newBounds.width).toBe(targetWidth);
    expect(newBounds.height).toBeGreaterThanOrEqual(targetHeight - heightTolerance);
    expect(newBounds.height).toBeLessThanOrEqual(targetHeight + heightTolerance);
    expect(newBounds.width).not.toBe(initialBounds.width);
    expect(newBounds.height).not.toBe(initialBounds.height);
  });

  test('should have working preload script with versions API', async () => {
    const nodeVersion = await mainPage.evaluate(() => window.versions.node());

    expect(typeof nodeVersion).toBe('string');
  });

  test('should render React UI', async () => {
    const sideBarHeading = mainPage.getByText('CHANNELS');
    const newChartButton = mainPage.getByRole('button', { name: 'New Chart' });

    expect(sideBarHeading).toBeVisible();
    expect(newChartButton).toBeVisible();
  });
});
