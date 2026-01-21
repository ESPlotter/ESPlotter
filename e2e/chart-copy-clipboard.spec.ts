import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;
let mainPageTest: MainPageTestObject;

test.describe('Chart copy to clipboard', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('copies chart image to clipboard', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    await mainPageTest.charts.expectSelectedChart('Voltage');
    await mainPageTest.charts.waitForChartData('Voltage');
    await mainPageTest.charts.copyChartImage('Voltage');

    await mainPageTest.clipboard.expectImageDataUrl();
    await mainPageTest.clipboard.expectImageHasContent();
  });
});
