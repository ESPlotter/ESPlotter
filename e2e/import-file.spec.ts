import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import { Menu as ElectronMenu, MenuItem as ElectronMenuItem } from 'electron';

import { ensureMenuItemWithAccelerator } from './support/ensureMenuItemWithAccelerator';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerImportMenu } from './support/triggerImportMenu';
import { waitForLastOpenedChannelFileChanged } from './support/waitForLastOpenedChannelFileChanged';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Import flow', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('imports a valid file (test3.json) and renders the chart', async () => {
    await setNextOpenFixturePath(electronApp, 'test3.json');

    const parsedPromise = waitForLastOpenedChannelFileChanged(mainPage);
    await triggerImportMenu(electronApp, mainPage);
    await parsedPromise;

    await expectChannelVisible(mainPage);
  });

  test('assigns shortcut only to Open File (.out)', async () => {
    await expectMenuItemWithoutAccelerator(electronApp, ['File', 'Import']);
    await ensureMenuItemWithAccelerator(electronApp, ['File', 'Open File (.out)'], 'CmdOrCtrl+O');
  });

  test('fails to open invalid format (test1.json)', async () => {
    await setNextOpenFixturePath(electronApp, 'test1.json');

    await triggerImportMenu(electronApp, mainPage);

    await expectNoChannelVisible(mainPage);
  });

  test('fails to open not found path', async () => {
    await setNextOpenFixturePath(electronApp, 'does-not-exist.json');

    await triggerImportMenu(electronApp, mainPage);

    await expectNoChannelVisible(mainPage);
  });
});

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

async function expectMenuItemWithoutAccelerator(
  app: ElectronApplication,
  labels: string[],
): Promise<void> {
  await app.evaluate(
    ({ Menu }, { labels }) => {
      const menu = Menu.getApplicationMenu();
      if (!menu) {
        throw new Error('Application menu is not registered');
      }

      function findMenuItem(currentMenu: ElectronMenu, path: string[]): ElectronMenuItem | null {
        let current = currentMenu;
        for (let i = 0; i < path.length; i++) {
          const item = current.items.find((it) => it.label === path[i]);
          if (!item) {
            return null;
          }
          if (i === path.length - 1) {
            return item;
          }
          if (!item.submenu) {
            return null;
          }
          current = item.submenu;
        }
        return null;
      }

      const item = findMenuItem(menu, labels);
      if (!item) {
        throw new Error(`Menu item path "${labels.join(' > ')}" was not found`);
      }

      if (item.accelerator) {
        throw new Error(
          `Menu item "${labels.at(-1) ?? ''}" should not have an accelerator, found "${item.accelerator}"`,
        );
      }
    },
    { labels },
  );
}
