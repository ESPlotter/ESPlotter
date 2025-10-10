import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import { getElectronAppForE2eTest } from './support/getElectronAppForE2eTest';
import { waitForPreloadScript } from './support/waitForPreloadScript';
import { waitForReactContent } from './support/waitForReactContent';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('File → Open (Native Menu Click)', () => {
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

  test('clicks the menu item and updates UI + recents', async () => {
    const { filePath } = await electronApp.evaluate(async (electron) => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'uniplot-e2e-'));
      const filePath = path.join(dir, 'e2e-menu-click.txt');
      await fs.writeFile(filePath, 'hello from menu click');

      // Stub native dialog
      electron.dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [filePath] });

      // Click the native application menu item by id
      const menu = electron.Menu.getApplicationMenu();

      if (!menu) throw new Error('No application menu found');

      const item = menu.items.find((i) => i.label === 'Open File');
      const win = electron.BrowserWindow.getAllWindows()[0];
      if (!item) throw new Error('"Open File" menu item not found');
      item.click(undefined, win, undefined);

      return { filePath };
    });

    // Verify UI updated
    await expect(mainPage.getByText('Last opened file')).toBeVisible();
    await expect(mainPage.locator('pre')).toContainText('hello from menu click');
    await expect(mainPage.getByText('Recent files')).toBeVisible();
    await expect(mainPage.getByText(filePath)).toBeVisible();
  });
});
