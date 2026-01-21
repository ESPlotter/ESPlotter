import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;
let mainPageTest: MainPageTestObject;

test.describe('Chart rename', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('allows renaming a chart from its title', async () => {
    const defaultTitle = await mainPageTest.charts.createChart();
    const newName = 'Custom chart name';

    await mainPageTest.charts.expectTitleButtonVisible(defaultTitle);
    await mainPageTest.charts.renameChartTitle(defaultTitle, newName);
    await mainPageTest.charts.expectTitleButtonVisible(newName);
    await mainPageTest.charts.expectTitleButtonNotVisible(defaultTitle);
  });

  test('cancels title changes when pressing Escape', async () => {
    const defaultTitle = await mainPageTest.charts.createChart();

    await mainPageTest.charts.cancelChartRename(defaultTitle, 'Temporary name');
    await mainPageTest.charts.expectTitleButtonVisible(defaultTitle);
  });
});
