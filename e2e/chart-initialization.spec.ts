import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Chart initialization', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('should show the default chart when application starts', async () => {
    await mainPageTest.charts.expectChartTitlesCount(1);
    await mainPageTest.charts.expectChartTitlesEqual(['Chart 1']);
    await mainPageTest.charts.expectChartCount(1);
    await mainPageTest.charts.expectTitleHeadingVisible('Chart 1');
  });

  test('should have new chart button available when application starts', async () => {
    await mainPageTest.charts.expectNewChartButtonVisible();
  });
});
