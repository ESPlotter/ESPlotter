import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Chart title initialization', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('creates charts with incremental default names', async () => {
    await mainPageTest.charts.createChart();
    await mainPageTest.charts.expectChartTitlesContain(['Chart 1']);

    await mainPageTest.charts.createChart();
    await mainPageTest.charts.expectChartTitlesContain(['Chart 2']);

    await mainPageTest.charts.createChart();
    await mainPageTest.charts.expectChartTitlesContain(['Chart 3']);
  });

  test('renames chart to channel name when adding first channel', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json');

    const chartTitle = await mainPageTest.charts.createChart();

    await mainPageTest.charts.selectChartByTitle(chartTitle);
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    await mainPageTest.charts.expectChartTitlesContain(['Voltage']);
    await mainPageTest.charts.expectChartTitlesNotContain(['Chart 1']);
  });

  test('does not rename chart when adding second channel', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json');

    const chartTitle = await mainPageTest.charts.createChart();
    await mainPageTest.charts.selectChartByTitle(chartTitle);

    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    await mainPageTest.charts.expectChartTitlesContain(['Voltage']);

    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)');

    await mainPageTest.charts.expectChartTitlesContain(['Voltage']);
    await mainPageTest.charts.expectChartTitlesNotContain(['Frequency']);
  });

  test('does not rename chart if user has manually changed the title', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json');

    const chartTitle = await mainPageTest.charts.createChart();
    const customTitle = 'My Custom Chart';

    await mainPageTest.charts.renameChartTitle(chartTitle, customTitle);
    await mainPageTest.charts.expectTitleButtonVisible(customTitle);

    await mainPageTest.charts.selectChartByTitle(customTitle);
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    await mainPageTest.charts.expectChartTitlesContain([customTitle]);
    await mainPageTest.charts.expectChartTitlesNotContain(['Voltage']);
  });
});
