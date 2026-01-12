import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createAndSelectChart } from './support/createAndSelectChart';
import { openFixtureAndExpandInSidebar } from './support/openFixtureAndExpandInSidebar';
import { readClipboardImageSize } from './support/readClipboardImage';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart grid copy to clipboard', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows the copy button when two charts exist', async () => {
    const copyButton = mainPage.getByRole('button', { name: 'Copy visible charts' });

    await createChartsWithChannel(mainPage, 1);
    await expect(copyButton).toHaveCount(0);

    await createChartsWithChannel(mainPage, 1);
    await expect(copyButton).toBeVisible();
  });

  test('copies only visible charts from the grid', async () => {
    await createChartsWithChannel(mainPage, 5);

    const scrollContainer = mainPage.getByTestId('chart-scroll-container');
    const sizes = await scrollContainer.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));

    if (sizes.scrollHeight > sizes.clientHeight) {
      await scrollContainer.evaluate((element) => {
        element.scrollTop = element.clientHeight;
      });
    }

    const expectedSize = await scrollContainer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });

    await mainPage.getByRole('button', { name: 'Copy visible charts' }).click();

    await expect
      .poll(async () => await readClipboardImageSize(electronApp), { timeout: 10000 })
      .toEqual(expectedSize);
  });
});

async function createChartsWithChannel(page: Page, count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await createAndSelectChart(page);
    await clickSidebarChannel(page, 'Voltage (V)');
  }
}
