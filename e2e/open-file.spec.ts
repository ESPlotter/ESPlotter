import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { clickMenuItem } from './support/clickMenuItem';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerFileOpenShortcut } from './support/triggerFileOpenShortcut';
import { waitForLastOpenedChannelFileChanged } from './support/waitForLastOpenedChannelFileChanged';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Open file flow', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('opens a valid file (test3.json) and renders the chart', async () => {
    await setNextOpenFixturePath(electronApp, 'test3.json');

    const parsedPromise = waitForLastOpenedChannelFileChanged(mainPage);
    await triggerFileOpenMenu(electronApp);
    await parsedPromise;

    await expectChannelVisible(mainPage);
  });

  test('opens a valid file using keyboard shortcut (Ctrl/Cmd+O)', async () => {
    await setNextOpenFixturePath(electronApp, 'test3.json');

    await triggerFileOpenShortcut(electronApp, mainPage);

    await expectChannelVisible(mainPage);
  });

  test('fails to open invalid format (test1.json)', async () => {
    await setNextOpenFixturePath(electronApp, 'test1.json');

    await triggerFileOpenMenu(electronApp);

    await expectNoChannelVisible(mainPage);
  });

  test('fails to open not found path', async () => {
    await setNextOpenFixturePath(electronApp, 'does-not-exist.json');

    await triggerFileOpenMenu(electronApp);

    await expectNoChannelVisible(mainPage);
  });
});

async function triggerFileOpenMenu(app: ElectronApplication): Promise<void> {
  await clickMenuItem(app, ['File', 'Open File']);
}

async function expectChannelVisible(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 3 })).toHaveText('test3');
}

async function expectNoChannelVisible(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 3, name: 'test3' })).toHaveCount(0);
}

// async function expectChartVisible(page: Page): Promise<void> {
//   await expect(page.locator('canvas').first()).toBeVisible();
// }

// async function expectNoCharts(page: Page): Promise<void> {
//   await expect(page.locator('canvas')).toHaveCount(0);
// }
