import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Chart copy to clipboard', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
    await mainPageTest.openChannelFileAndExpandInSidebar('test3.json');
  });

  test.afterEach(async () => {
    await mainPageTest.close();
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

  test('copies chart image to clipboard with S shortcut', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    await mainPageTest.charts.expectSelectedChart('Voltage');
    await mainPageTest.charts.waitForChartData('Voltage');

    await mainPageTest.charts.pressCopyChartShortcut();

    await mainPageTest.clipboard.expectImageDataUrl();
    await mainPageTest.clipboard.expectImageHasContent();
  });
});
