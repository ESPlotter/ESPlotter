import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createChart } from './support/createChart';
import { expandFileInSidebar } from './support/expandFileInSidebar';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { openFixtureViaImportMenu } from './support/openFixtureViaImportMenu';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Close channel files', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should close a channel file and remove it from the sidebar', async () => {
    // Open a test file
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await expandFileInSidebar(mainPage, 'test1');

    // Verify file is visible in sidebar
    await expect(mainPage.getByRole('button', { name: 'test1' })).toBeVisible();

    // Click the close button (X icon)
    const closeButton = mainPage.getByRole('button', { name: /close file/i }).first();
    await closeButton.click();

    // Verify file is removed from sidebar
    await expect(mainPage.getByRole('button', { name: 'test1' })).not.toBeVisible();
  });

  test('should remove channels from chart when closing the file', async () => {
    // Open a test file
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await expandFileInSidebar(mainPage, 'test1');

    // Create a chart and add a channel
    await createChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage ()');

    // Verify channel is displayed in chart
    let seriesSummary = await getRenderedSeriesSummary(mainPage, 0);
    expect(seriesSummary.seriesCount).toBeGreaterThan(0);

    // Close the file
    const closeButton = mainPage.getByRole('button', { name: /close file/i }).first();
    await closeButton.click();

    // Verify channels are removed from chart
    seriesSummary = await getRenderedSeriesSummary(mainPage, 0);
    expect(seriesSummary.seriesCount).toBe(0);
  });

  test('should only remove channels from the closed file', async () => {
    // Open two test files
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await openFixtureViaImportMenu(electronApp, mainPage, 'test4.csv');

    // Expand both files
    await expandFileInSidebar(mainPage, 'test1');
    await expandFileInSidebar(mainPage, 'test4');

    // Create a chart and add channels from both files
    await createChart(mainPage);

    // Add channel from test1
    await clickSidebarChannel(mainPage, 'Voltage ()', 'test1');

    // Add channel from test4
    await clickSidebarChannel(mainPage, 'Active Power ()', 'test4');

    // Verify both channels are in chart
    let seriesSummary = await getRenderedSeriesSummary(mainPage, 0);
    expect(seriesSummary.seriesCount).toBe(2);

    // Close test1 file
    const closeButtons = mainPage.getByRole('button', { name: /close file/i });
    await closeButtons.first().click();

    // Verify test1 is removed but test4 remains
    await expect(mainPage.getByRole('button', { name: 'test1' })).not.toBeVisible();
    await expect(mainPage.getByRole('button', { name: 'test4' })).toBeVisible();

    // Verify only one channel remains in chart
    seriesSummary = await getRenderedSeriesSummary(mainPage, 0);
    expect(seriesSummary.seriesCount).toBe(1);
  });
});
