import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createAndSelectChart } from './support/createAndSelectChart';
import { openFixtureAndExpandInSidebar } from './support/openFixtureAndExpandInSidebar';
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

  test('copies only visible charts from the grid', async () => {
    await createChartsWithChannel(mainPage, 5);

    const scrollContainer = mainPage.locator('main > section');
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

interface ClipboardImageSize {
  width: number;
  height: number;
}

async function readClipboardImageSize(
  app: ElectronApplication,
): Promise<ClipboardImageSize | null> {
  return app.evaluate(({ clipboard }) => {
    const image = clipboard.readImage();
    if (image.isEmpty()) {
      return null;
    }
    const size = image.getSize();
    return { width: size.width, height: size.height };
  });
}
