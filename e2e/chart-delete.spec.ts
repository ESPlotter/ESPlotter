import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Chart deletion', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('allows deleting a single chart', async () => {
    const chart1Title = await mainPageTest.charts.createChart();
    await mainPageTest.charts.createChart();

    await mainPageTest.charts.selectChartByTitle(chart1Title);
    await mainPageTest.charts.deleteChart(chart1Title);

    await mainPageTest.charts.expectChartTitlesRenumbered(1);
  });

  test('allows deleting a chart using the Delete key hotkey', async () => {
    const chart1Title = await mainPageTest.charts.createChart();
    await mainPageTest.charts.createChart();

    await mainPageTest.charts.selectChartByTitle(chart1Title);
    await mainPageTest.charts.pressDeleteChartShortcut();

    await mainPageTest.charts.expectChartTitlesRenumbered(1);
  });

  test('deletes all charts using the delete all button', async () => {
    await mainPageTest.charts.createChart();
    await mainPageTest.charts.createChart();
    const chart3Title = await mainPageTest.charts.createChart();

    await mainPageTest.charts.expectChartTitlesCount(3);

    await mainPageTest.charts.deleteAllCharts();

    await mainPageTest.charts.expectChartTitlesNotContain([chart3Title]);
    await mainPageTest.charts.expectChartTitlesRenumbered(1);
  });

  test('deletes all charts using the Shift+Delete hotkey', async () => {
    await mainPageTest.charts.createChart();
    await mainPageTest.charts.createChart();
    const chart3Title = await mainPageTest.charts.createChart();

    await mainPageTest.charts.expectChartTitlesCount(3);

    await mainPageTest.charts.pressDeleteAllChartsShortcut();

    await mainPageTest.charts.expectChartTitlesNotContain([chart3Title]);
    await mainPageTest.charts.expectChartTitlesRenumbered(1);
  });

  test('check if delete button is hidden when is first chart and there is no channel', async () => {
    const chartTitle = await mainPageTest.charts.createChart();
    await mainPageTest.charts.expectDeleteButtonHidden(chartTitle);
  });

  test('check if delete button is not hidden when is first chart and there is channel', async () => {
    const channelTitle = 'Voltage (V)';
    await mainPageTest.openChannelFileAndExpandInSidebar('test3.json');
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectShowDeletedButton('Voltage');
  });

});
