import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

test.describe('Open .out files', () => {
  let electronApp: ElectronApplication;
  let mainPage: Page;
  let mainPageTest: MainPageTestObject;

  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows channels and plots a serie from example.out', async () => {
    test.skip(process.env.CI === 'true', 'Skipping in CI because it depends on dyntools');

    await mainPageTest.openOutFixture('example.out');

    const channelLabel = await mainPageTest.sidebar.getFirstChannelLabel();

    const chartTitle = await mainPageTest.charts.createChart();
    await mainPageTest.charts.selectChartByTitle(chartTitle);

    await mainPageTest.sidebar.toggleChannel(channelLabel);

    await mainPageTest.charts.expectSelectedChart('PPOI_MW');
    await mainPageTest.charts.expectFirstSeriesDataLengthGreaterThan('PPOI_MW', 0);
    await mainPageTest.sidebar.expectChannelLabelVisible(channelLabel);
  });
});
