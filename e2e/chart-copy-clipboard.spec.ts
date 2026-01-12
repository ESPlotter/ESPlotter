import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { chartTitleButton } from './support/chartTitleButton';
import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createAndSelectChart } from './support/createAndSelectChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { openFixtureAndExpandInSidebar } from './support/openFixtureAndExpandInSidebar';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart copy to clipboard', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('copies chart image to clipboard', async () => {
    await createAndSelectChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    await expectSelectedChart(mainPage, 'Voltage');
    await waitForChartData(mainPage, 'Voltage');

    const chartRoot = getChartRoot(mainPage, 'Voltage');
    const copyButton = chartRoot.getByTitle('Copy chart image');

    await copyButton.click();

    await expect
      .poll(async () => await readClipboardImage(electronApp), { timeout: 10000 })
      .toMatch(/^data:image\/png;base64,/);
  });
});

function getChartRoot(page: Page, chartTitle: string) {
  return page.locator('article').filter({ has: chartTitleButton(page, chartTitle) });
}

async function waitForChartData(page: Page, chartTitle: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const series = await getRenderedSeriesSummary(page, chartTitle);
        return series.some((serie) => serie.dataLength > 0);
      },
      { timeout: 10000 },
    )
    .toBe(true);
}

async function readClipboardImage(app: ElectronApplication): Promise<string> {
  return app.evaluate(({ clipboard }) => {
    const image = clipboard.readImage();
    return image.isEmpty() ? '' : image.toDataURL();
  });
}
