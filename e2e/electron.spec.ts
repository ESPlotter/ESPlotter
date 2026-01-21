import { test } from '@playwright/test';

import { ElectronAppTestObject } from './support/ElectronAppTestObject';
import { MainPageTestObject } from './support/MainPageTestObject';

let appTest: ElectronAppTestObject;
let mainPageTest: MainPageTestObject;

test.describe('Electron App', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
    appTest = new ElectronAppTestObject(mainPageTest.electronApp, mainPageTest.mainPage);
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('should launch electron app', async () => {
    await appTest.expectAppName('esplotter');
  });

  test('should have proper window dimensions', async () => {
    await appTest.expectWindowHasSize();
  });

  test('should be able to resize window', async () => {
    const targetWidth = 600;
    const targetHeight = 700;
    await appTest.expectWindowResizesTo(targetWidth, targetHeight);
  });

  test('should have working preload script with versions API', async () => {
    await appTest.expectPreloadVersionsAvailable();
  });

  test('should render React UI', async () => {
    await mainPageTest.sidebar.expectHeaderVisible();
    await mainPageTest.charts.expectNewChartButtonVisible();
  });
});
