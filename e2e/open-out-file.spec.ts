import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { chartContainer } from './support/chartContainer';
import { clickMenuItem } from './support/clickMenuItem';
import { createChart } from './support/createChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { waitForLastOpenedChannelFileChanged } from './support/waitForLastOpenedChannelFileChanged';

test.describe('Open .out files', () => {
  let electronApp: ElectronApplication;
  let mainPage: Page;

  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows channels and plots a serie from example.out', async () => {
    await openExampleOutFile(electronApp, mainPage);

    const channelButton = await getFirstChannelButton(mainPage);
    const channelLabel = (await channelButton.innerText()).trim();

    const chartTitle = await createChart(mainPage);
    await selectChartByTitle(mainPage, chartTitle);

    await channelButton.click();

    await expectSelectedChart(mainPage, 'PPOI_MW');
    await expect
      .poll(async () => {
        const renderedSeries = await getRenderedSeriesSummary(mainPage, 'PPOI_MW');
        return renderedSeries.length > 0 ? renderedSeries[0].dataLength : 0;
      })
      .toBeGreaterThan(0);

    await expect(channelButton).toHaveText(channelLabel);
  });
});

async function openExampleOutFile(app: ElectronApplication, page: Page): Promise<void> {
  await setNextOpenFixturePath(app, 'example.out');

  const parsedPromise = waitForLastOpenedChannelFileChanged(page);
  await clickMenuItem(app, ['File', 'Open File (.out)']);
  await parsedPromise;

  const fileHeading = page.getByRole('heading', { level: 3 }).first();
  await fileHeading.waitFor({ state: 'visible' });
  await fileHeading.click();
}

async function getFirstChannelButton(page: Page) {
  const channelButtons = page.locator('[data-sidebar="menu-button"]');
  await expect.poll(async () => channelButtons.count()).toBeGreaterThan(0);
  return channelButtons.first();
}

async function selectChartByTitle(page: Page, chartTitle: string): Promise<void> {
  const chartLocator = chartContainer(page, chartTitle);
  await chartLocator.waitFor({ state: 'visible' });
  await chartLocator.click();
  await expectSelectedChart(page, chartTitle);
}
