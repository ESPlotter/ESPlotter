import { test, type ElectronApplication, type Page } from '@playwright/test';

import { ElectronAppTestObject } from './support/ElectronAppTestObject';
import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;
let appTest: ElectronAppTestObject;
let mainPageTest: MainPageTestObject;

test.describe('Electron App', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    appTest = new ElectronAppTestObject(electronApp, mainPage);
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
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
