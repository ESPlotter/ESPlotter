import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import { getElectronAppForE2eTest } from './support/getElectronAppForE2eTest';
import { waitForPreloadScript } from './support/waitForPreloadScript';
import { waitForReactContent } from './support/waitForReactContent';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('File → Open (Menu)', () => {
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

  test('opens file via accelerator and updates UI + recents', async () => {
    const { filePath } = await electronApp.evaluate(async (electron) => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'uniplot-e2e-'));
      const filePath = path.join(dir, 'e2e.txt');
      await fs.writeFile(filePath, 'hello e2e');

      // Stub the open dialog to auto-select our file
      electron.dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [filePath] });

      return { filePath };
    });

    // Trigger accelerator for File → Open (CmdOrCtrl+O)
    const accel = process.platform === 'darwin' ? 'Meta+O' : 'Control+O';
    await mainPage.keyboard.press(accel);

    // Expect the preview panel and our content
    await expect(mainPage.getByText('Last opened file')).toBeVisible();
    await expect(mainPage.locator('pre')).toContainText('hello e2e');

    // Expect Recent files section lists our path
    await expect(mainPage.getByText('Recent files')).toBeVisible();
    await expect(mainPage.getByText(filePath)).toBeVisible();
  });
});
