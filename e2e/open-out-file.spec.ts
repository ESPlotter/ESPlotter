import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

test.describe('Open .out files', () => {
  let mainPageTest: MainPageTestObject;

  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test.skip('shows channels and plots a serie from example.out', async () => {
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
