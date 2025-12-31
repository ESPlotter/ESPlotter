import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { createChart } from './support/createChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { getChartTitles } from './support/getChartTitles';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerImportMenu } from './support/triggerImportMenu';
import { waitForLastOpenedChannelFileChanged } from './support/waitForLastOpenedChannelFileChanged';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart title initialization', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('creates charts with incremental default names', async () => {
    const firstChartTitle = await createChart(mainPage);
    expect(firstChartTitle).toBe('Chart 1');

    const secondChartTitle = await createChart(mainPage);
    expect(secondChartTitle).toBe('Chart 2');

    const thirdChartTitle = await createChart(mainPage);
    expect(thirdChartTitle).toBe('Chart 3');
  });

  test('renames chart to channel name when adding first channel', async () => {
    await openAndExpandTest3File(electronApp, mainPage);

    const chartTitle = await createChart(mainPage);
    expect(chartTitle).toBe('Chart 1');

    await selectChartByTitle(mainPage, chartTitle);
    await clickSidebarChannel(mainPage, 'Voltage (V)');

    const updatedTitles = await getChartTitles(mainPage);
    expect(updatedTitles).toContain('Voltage');
    expect(updatedTitles).not.toContain('Chart 1');
  });

  test('does not rename chart when adding second channel', async () => {
    await openAndExpandTest3File(electronApp, mainPage);

    const chartTitle = await createChart(mainPage);
    await selectChartByTitle(mainPage, chartTitle);

    await clickSidebarChannel(mainPage, 'Voltage (V)');

    const titlesAfterFirstChannel = await getChartTitles(mainPage);
    expect(titlesAfterFirstChannel).toContain('Voltage');

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');

    const titlesAfterSecondChannel = await getChartTitles(mainPage);
    expect(titlesAfterSecondChannel).toContain('Voltage');
    expect(titlesAfterSecondChannel).not.toContain('Frequency');
  });

  test('does not rename chart if user has manually changed the title', async () => {
    await openAndExpandTest3File(electronApp, mainPage);

    const chartTitle = await createChart(mainPage);
    const customTitle = 'My Custom Chart';

    await mainPage.getByRole('button', { name: chartTitle }).click();
    const input = mainPage.getByRole('textbox', { name: 'Chart name' });
    await input.fill(customTitle);
    await input.press('Enter');

    await expect(mainPage.getByRole('button', { name: customTitle })).toBeVisible();

    await selectChartByTitle(mainPage, customTitle);
    await clickSidebarChannel(mainPage, 'Voltage (V)');

    const updatedTitles = await getChartTitles(mainPage);
    expect(updatedTitles).toContain(customTitle);
    expect(updatedTitles).not.toContain('Voltage');
  });
});

async function openAndExpandTest3File(app: ElectronApplication, page: Page): Promise<void> {
  await setNextOpenFixturePath(app, 'test3.json');

  const parsedPromise = waitForLastOpenedChannelFileChanged(page);
  await triggerImportMenu(app, page);
  await parsedPromise;

  const fileTrigger = page.getByRole('button', { name: 'test3' });
  await fileTrigger.waitFor({ state: 'visible' });
  await fileTrigger.click();
}

import { chartContainer } from './support/chartContainer';

async function selectChartByTitle(page: Page, chartTitle: string): Promise<void> {
  const chartLocator = chartContainer(page, chartTitle);
  await chartLocator.waitFor({ state: 'visible' });
  await chartLocator.click();
  await expectSelectedChart(page, chartTitle);
}

async function clickSidebarChannel(page: Page, channelLabel: string): Promise<void> {
  await page
    .locator('[data-sidebar="menu-button"]')
    .filter({ hasText: channelLabel })
    .first()
    .click();
}
