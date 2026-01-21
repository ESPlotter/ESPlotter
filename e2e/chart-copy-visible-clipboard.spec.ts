import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Chart grid copy to clipboard', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json');
  });

  test.afterEach(async () => {
    await mainPageTest.close();
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
