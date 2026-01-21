import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { clickSidebarChannel } from './support/clickSidebarChannel';
import { closeChannelFile } from './support/closeChannelFile';
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
    await closeChannelFile(mainPage, 'test1');

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
    let seriesSummary = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(seriesSummary.length).toBeGreaterThan(0);

    // Close the file
    await closeChannelFile(mainPage, 'test1');

    // Verify channels are removed from chart
    seriesSummary = await getRenderedSeriesSummary(mainPage, 'Chart 1');
    expect(seriesSummary.length).toBe(0);
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
    let seriesSummary = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(seriesSummary.length).toBe(2);

    // Close test1 file
    await closeChannelFile(mainPage, 'test1');

    // Verify test1 is removed but test4 remains
    await expect(mainPage.getByRole('button', { name: 'test1' })).not.toBeVisible();
    await expect(mainPage.getByRole('button', { name: 'test4' })).toBeVisible();

    // Verify only one channel remains in chart
    seriesSummary = await getRenderedSeriesSummary(mainPage, 'Active Power');
    expect(seriesSummary.length).toBe(1);
  });

  test('should reset chart title to default when closing file makes chart empty and title matched channel', async () => {
    // Open a test file
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await expandFileInSidebar(mainPage, 'test1');

    // Create a chart and add a channel
    await createChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage ()');

    // Verify chart title was set to channel name "Voltage"
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Voltage' })).toBeVisible();

    // Close the file
    await closeChannelFile(mainPage, 'test1');

    // Verify chart title reset to "Chart 1" (chart position)
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Chart 1' })).toBeVisible();

    // Verify channels are removed from chart
    const seriesSummary = await getRenderedSeriesSummary(mainPage, 'Chart 1');
    expect(seriesSummary.length).toBe(0);
  });

  test('should update chart title to first remaining channel when title matched removed channel', async () => {
    // Open two test files
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await openFixtureViaImportMenu(electronApp, mainPage, 'test4.csv');

    // Expand both files
    await expandFileInSidebar(mainPage, 'test1');
    await expandFileInSidebar(mainPage, 'test4');

    // Create a chart and add channels from both files
    await createChart(mainPage);

    // Add channel from test1 first
    await clickSidebarChannel(mainPage, 'Voltage ()', 'test1');

    // Verify chart title was set to "Voltage"
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Voltage' })).toBeVisible();

    // Add channel from test4
    await clickSidebarChannel(mainPage, 'Active Power ()', 'test4');

    // Close test1 file (which has the Voltage channel)
    await closeChannelFile(mainPage, 'test1');

    // Verify chart title updated to "Active Power" (first remaining channel)
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Active Power' })).toBeVisible();

    // Verify only one channel remains in chart
    const seriesSummary = await getRenderedSeriesSummary(mainPage, 'Active Power');
    expect(seriesSummary.length).toBe(1);
  });

  test('should not change chart title when it does not match removed channel', async () => {
    // Open two test files
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await openFixtureViaImportMenu(electronApp, mainPage, 'test4.csv');

    // Expand both files
    await expandFileInSidebar(mainPage, 'test1');
    await expandFileInSidebar(mainPage, 'test4');

    // Create a chart and add channel from test1
    await createChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage ()', 'test1');

    // Manually change the chart title to a custom name
    const chartTitleHeading = mainPage.getByRole('heading', { level: 2, name: 'Voltage' });
    await chartTitleHeading.getByRole('button', { name: 'Voltage' }).click();
    const titleInput = mainPage.getByRole('textbox', { name: /chart name/i });
    await titleInput.fill('My Custom Chart');
    await titleInput.press('Enter');

    // Verify custom title is set
    await expect(
      mainPage.getByRole('heading', { level: 2, name: 'My Custom Chart' }),
    ).toBeVisible();

    // Add another channel from test4
    await clickSidebarChannel(mainPage, 'Active Power ()', 'test4');

    // Close test1 file
    await closeChannelFile(mainPage, 'test1');

    // Verify chart title remains "My Custom Chart" (unchanged)
    await expect(
      mainPage.getByRole('heading', { level: 2, name: 'My Custom Chart' }),
    ).toBeVisible();

    // Verify one channel remains in chart
    const seriesSummary = await getRenderedSeriesSummary(mainPage, 'My Custom Chart');
    expect(seriesSummary.length).toBe(1);
  });

  test('should handle multiple charts with different title scenarios', async () => {
    // Open two test files
    await openFixtureViaImportMenu(electronApp, mainPage, 'test1.txt');
    await openFixtureViaImportMenu(electronApp, mainPage, 'test4.csv');

    // Expand both files
    await expandFileInSidebar(mainPage, 'test1');
    await expandFileInSidebar(mainPage, 'test4');

    // Create chart 1 with only test1 Voltage
    await createChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage ()', 'test1');
    await expect(
      mainPage.getByRole('heading', { level: 2, name: 'Voltage' }).first(),
    ).toBeVisible();

    // Create chart 2 with test1 Voltage and test4 Active Power
    await createChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage ()', 'test1');
    await clickSidebarChannel(mainPage, 'Active Power ()', 'test4');

    // Create chart 3 with only test1 Reactive Power
    await createChart(mainPage);
    await clickSidebarChannel(mainPage, 'Reactive Power ()', 'test1');

    // Close test1 file
    await closeChannelFile(mainPage, 'test1');

    // Chart 1: Had "Voltage" title, removed Voltage, now empty -> should be "Chart 1"
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Chart 1' })).toBeVisible();

    // Chart 2: Had "Voltage" title, removed Voltage, still has Active Power -> should be "Active Power"
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Active Power' })).toBeVisible();

    // Chart 3: Had "Reactive Power" title, removed Reactive Power, now empty -> should be "Chart 3"
    await expect(mainPage.getByRole('heading', { level: 2, name: 'Chart 3' })).toBeVisible();

    // Verify series counts
    let seriesSummary = await getRenderedSeriesSummary(mainPage, 'Chart 1');
    expect(seriesSummary.length).toBe(0);

    seriesSummary = await getRenderedSeriesSummary(mainPage, 'Active Power');
    expect(seriesSummary.length).toBe(1);

    seriesSummary = await getRenderedSeriesSummary(mainPage, 'Chart 3');
    expect(seriesSummary.length).toBe(0);
  });
});
