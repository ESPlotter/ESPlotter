import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { openFixtureViaImportMenu } from './support/openFixtureViaImportMenu';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Import CSV/TXT files', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('imports a valid TXT file (test1.txt) and renders channels', async () => {
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');

    await expectChannelVisible(mainPage, 'test1');
    await expectChannelsInSidebar(mainPage, ['Voltage', 'Active Power', 'Reactive Power']);
  });
});

async function expectChannelVisible(page: Page, fileName: string): Promise<void> {
  await expect(page.getByRole('heading', { level: 3, name: fileName })).toBeVisible();
}

async function expectChannelsInSidebar(page: Page, channelNames: string[]): Promise<void> {
  for (const channelName of channelNames) {
    await expect(
      page.locator('[data-sidebar="menu-button"]', { hasText: channelName }),
    ).toBeVisible();
  }
}
