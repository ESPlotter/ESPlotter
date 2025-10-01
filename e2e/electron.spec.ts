import { test, expect, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import { waitForReactContent } from './support/waitForReactContent';
import { waitForPreloadScript } from './support/waitForPreloadScript';
import { getElectronAppForE2eTest } from './support/getElectronAppForE2eTest';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Electron App', () => {

  test.beforeEach(async () => {
    electronApp = await getElectronAppForE2eTest();

    mainPage = await electronApp.firstWindow();

    await mainPage.waitForLoadState('domcontentloaded');
    await waitForPreloadScript(mainPage);
    await waitForReactContent(mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('should launch electron app', async () => {
    const name = await electronApp.evaluate((electron) => electron.app.getName());

    expect(name).toBe('uniplot');
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

    await electronApp.evaluate(async (electron) => {
      const mainWindow = electron.BrowserWindow.getAllWindows()[0];
      mainWindow.setSize(600, 700);
    });

    const newBounds = await electronApp.evaluate((electron) => {
      const mainWindow = electron.BrowserWindow.getAllWindows()[0];
      return mainWindow.getBounds();
    });

    expect(newBounds.width).toBe(600);
    expect(newBounds.height).toBe(700);
    expect(newBounds.width).not.toBe(initialBounds.width);
    expect(newBounds.height).not.toBe(initialBounds.height);
  });

  test('should have working preload script with versions API', async () => {
    const nodeVersion = await mainPage.evaluate(() => {
      return (window as any).versions.node();
    });
    
    const pingResult = await mainPage.evaluate(async () => {
      return await (window as any).versions.ping();
    });

    expect(typeof nodeVersion).toBe('string');
    expect(pingResult).toBe('pong');
  });

  test('should render React UI', async () => {
    const heading = mainPage.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('Hello from React!');

    const versionsParagraph = mainPage.locator('p');
    await expect(versionsParagraph).toContainText('Chrome');
    await expect(versionsParagraph).toContainText('Node.js');
    await expect(versionsParagraph).toContainText('Electron');

    const pingButton = mainPage.getByRole('button', { name: 'ping' });
    await expect(pingButton).toBeVisible();
    await expect(pingButton).toBeEnabled();
  });
});
