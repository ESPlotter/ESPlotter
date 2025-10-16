import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { waitForReactContent } from './support/waitForReactContent';
import { waitForPreloadScript } from './support/waitForPreloadScript';
import { getElectronAppForE2eTest } from './support/getElectronAppForE2eTest';
import { clickMenuItem } from './support/clickMenuItem';
import { triggerFileOpenShortcut } from './support/triggerFileOpenShortcut';
import { waitForFileParsed } from './support/waitForFileParsed';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';

let electronApp: ElectronApplication;
let mainPage: Page;

async function triggerFileOpenMenu(app: ElectronApplication): Promise<void> {
  await clickMenuItem(app, ['File', 'Open File']);
}

async function expectChartVisible(page: Page): Promise<void> {
  await expect(page.locator('canvas').first()).toBeVisible();
}

async function expectNoCharts(page: Page): Promise<void> {
  await expect(page.locator('canvas')).toHaveCount(0);
}

test.describe('Open file flow', () => {
  test.beforeEach(async () => {
    const tmpStateDir = path.join(
      os.tmpdir(),
      `uniplot-e2e-state-${Date.now()}-${crypto.randomUUID()}`,
    );
    await fs.mkdir(tmpStateDir, { recursive: true });
    process.env.UNIPLOT_STATE_CWD = tmpStateDir;

    electronApp = await getElectronAppForE2eTest();
    mainPage = await electronApp.firstWindow();

    await mainPage.waitForLoadState('domcontentloaded');
    await waitForPreloadScript(mainPage);
    await waitForReactContent(mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('opens a valid file (test3.json) and renders the chart', async () => {
    await setNextOpenFixturePath(electronApp, 'test3.json');

    const parsedPromise = waitForFileParsed(mainPage);
    await triggerFileOpenMenu(electronApp);
    await parsedPromise;

    await expectChartVisible(mainPage);
  });

  test('opens a valid file using keyboard shortcut (Ctrl/Cmd+O)', async () => {
    await setNextOpenFixturePath(electronApp, 'test3.json');

    await triggerFileOpenShortcut(electronApp, mainPage);

    await expectChartVisible(mainPage);
  });

  test('fails to open invalid format (test1.json)', async () => {
    await setNextOpenFixturePath(electronApp, 'test1.json');

    await triggerFileOpenMenu(electronApp);

    await expectNoCharts(mainPage);
  });

  test('fails to open not found path', async () => {
    await setNextOpenFixturePath(electronApp, 'does-not-exist.json');

    await triggerFileOpenMenu(electronApp);

    await expectNoCharts(mainPage);
  });
});
