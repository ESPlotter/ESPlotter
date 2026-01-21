import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;
let mainPageTest: MainPageTestObject;

test.describe('Chart grid copy to clipboard', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows the copy button when two charts exist', async () => {
    await mainPageTest.createChartsWithChannel('Voltage (V)', 1);
    await mainPageTest.charts.expectCopyVisibleChartsButtonHidden();

    await mainPageTest.createChartsWithChannel('Voltage (V)', 1);
    await mainPageTest.charts.expectCopyVisibleChartsButtonVisible();
  });

  test('copies only visible charts from the grid', async () => {
    await mainPageTest.createChartsWithChannel('Voltage (V)', 5);
    await mainPageTest.charts.scrollChartGridToBottomIfNeeded();
    const expectedSize = await mainPageTest.charts.getChartGridSize();

    await mainPageTest.charts.copyVisibleCharts();

    await mainPageTest.clipboard.expectImageSize(expectedSize);
    await mainPageTest.clipboard.expectImageHasContent();
  });
});
