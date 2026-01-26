/* eslint-disable unused-imports/no-unused-vars */
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
    // Start with 1 default chart, create 2 more = 3 total
    const chart1Title = await mainPageTest.charts.createChart(); // Chart 2
    const chart2Title = await mainPageTest.charts.createChart(); // Chart 3

    await mainPageTest.charts.selectChartByTitle(chart1Title);
    await mainPageTest.charts.deleteChart(chart1Title);

    await mainPageTest.charts.expectChartTitlesRenumbered(2); // Should have Chart 1 and renumbered Chart 2
  });

  test('allows deleting a chart using the Delete key hotkey', async () => {
    // Start with 1 default chart, create 2 more = 3 total
    const chart1Title = await mainPageTest.charts.createChart(); // Chart 2
    const chart2Title = await mainPageTest.charts.createChart(); // Chart 3

    await mainPageTest.charts.selectChartByTitle(chart1Title);
    await mainPageTest.charts.pressDeleteChartShortcut();

    await mainPageTest.charts.expectChartTitlesRenumbered(2); // Should have Chart 1 and renumbered Chart 2
  });

  test('deletes all charts using the delete all button', async () => {
    // Start with 1 default chart, create 2 more = 3 total
    await mainPageTest.charts.createChart(); // Chart 2
    const chart3Title = await mainPageTest.charts.createChart(); // Chart 3

    await mainPageTest.charts.expectChartTitlesCount(3);

    await mainPageTest.charts.deleteAllCharts();

    await mainPageTest.charts.expectChartTitlesNotContain([chart3Title]);
    await mainPageTest.charts.expectChartTitlesRenumbered(1); // Only Chart 1 should remain
  });

  test('deletes all charts using the Shift+Delete hotkey', async () => {
    // Start with 1 default chart, create 2 more = 3 total
    await mainPageTest.charts.createChart(); // Chart 2
    const chart3Title = await mainPageTest.charts.createChart(); // Chart 3

    await mainPageTest.charts.expectChartTitlesCount(3);

    await mainPageTest.charts.pressDeleteAllChartsShortcut();

    await mainPageTest.charts.expectChartTitlesNotContain([chart3Title]);
    await mainPageTest.charts.expectChartTitlesRenumbered(1); // Only Chart 1 should remain
  });

  test('check if delete button is hidden when is first chart and there is no channel', async () => {
    // Chart 1 already exists and should have delete button hidden (no channels)
    await mainPageTest.charts.expectDeleteButtonHidden('Chart 1');
  });

  test('check if delete button is not hidden when is first chart and there is channel', async () => {
    const channelTitle = 'Voltage (V)';
    await mainPageTest.openChannelFileAndExpandInSidebar('test3.json');
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectShowDeletedButton('Voltage');
  });
});
