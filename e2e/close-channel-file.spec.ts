import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Close channel files', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('should close a channel file and remove it from the sidebar', async () => {
    await mainPageTest.openChannelFileAndExpandInSidebar('test1.txt');
    await mainPageTest.sidebar.expectFileVisible('test1');
    await mainPageTest.sidebar.closeChannelFile('test1');
    await mainPageTest.sidebar.expectFileNotVisible('test1');
  });

  test('should remove channels from chart when closing the file', async () => {
    await mainPageTest.openChannelFileAndExpandInSidebar('test1.txt');
    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Voltage ()');

    await mainPageTest.charts.expectSeriesCount('Voltage', 1);
    await mainPageTest.sidebar.closeChannelFile('test1');
    await mainPageTest.charts.expectSeriesCount('Chart 1', 0);
  });

  test('should only remove channels from the closed file', async () => {
    await mainPageTest.openChannelFile('test1.txt');
    await mainPageTest.openChannelFile('test4.csv');
    await mainPageTest.sidebar.expandChannelFile('test1');
    await mainPageTest.sidebar.expandChannelFile('test4');
    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Voltage ()', 'test1');
    await mainPageTest.sidebar.toggleChannel('Active Power ()', 'test4');

    await mainPageTest.charts.expectSeriesCount('Voltage', 2);

    await mainPageTest.sidebar.closeChannelFile('test1');

    await mainPageTest.sidebar.expectFileNotVisible('test1');
    await mainPageTest.sidebar.expectFileVisible('test4');
    await mainPageTest.charts.expectSeriesCount('Active Power', 1);
  });

  test('should reset chart title to default when closing file makes chart empty and title matched channel', async () => {
    await mainPageTest.openChannelFileAndExpandInSidebar('test1.txt');
    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Voltage ()');

    await mainPageTest.charts.expectTitleHeadingVisible('Voltage');

    await mainPageTest.sidebar.closeChannelFile('test1');

    await mainPageTest.charts.expectTitleHeadingVisible('Chart 1');
    await mainPageTest.charts.expectSeriesCount('Chart 1', 0);
  });

  test('should update chart title to first remaining channel when title matched removed channel', async () => {
    await mainPageTest.openChannelFile('test1.txt');
    await mainPageTest.openChannelFile('test4.csv');
    await mainPageTest.sidebar.expandChannelFile('test1');
    await mainPageTest.sidebar.expandChannelFile('test4');
    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Voltage ()', 'test1');

    await mainPageTest.charts.expectTitleHeadingVisible('Voltage');

    await mainPageTest.sidebar.toggleChannel('Active Power ()', 'test4');
    await mainPageTest.sidebar.closeChannelFile('test1');

    await mainPageTest.charts.expectTitleHeadingVisible('Active Power');
    await mainPageTest.charts.expectSeriesCount('Active Power', 1);
  });

  test('should not change chart title when it does not match removed channel', async () => {
    await mainPageTest.openChannelFile('test1.txt');
    await mainPageTest.openChannelFile('test4.csv');
    await mainPageTest.sidebar.expandChannelFile('test1');
    await mainPageTest.sidebar.expandChannelFile('test4');
    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Voltage ()', 'test1');
    await mainPageTest.charts.renameChartTitle('Voltage', 'My Custom Chart');
    await mainPageTest.charts.expectTitleHeadingVisible('My Custom Chart');

    await mainPageTest.sidebar.toggleChannel('Active Power ()', 'test4');
    await mainPageTest.sidebar.closeChannelFile('test1');

    await mainPageTest.charts.expectTitleHeadingVisible('My Custom Chart');
    await mainPageTest.charts.expectSeriesCount('My Custom Chart', 1);
  });

  test('should handle multiple charts with different title scenarios', async () => {
    await mainPageTest.openChannelFile('test1.txt');
    await mainPageTest.openChannelFile('test4.csv');
    await mainPageTest.sidebar.expandChannelFile('test1');
    await mainPageTest.sidebar.expandChannelFile('test4');

    await mainPageTest.charts.selectChartByTitle('Chart 1');
    await mainPageTest.sidebar.toggleChannel('Voltage ()', 'test1');
    await mainPageTest.charts.expectTitleHeadingVisible('Voltage', 0);

    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Voltage ()', 'test1');
    await mainPageTest.sidebar.toggleChannel('Active Power ()', 'test4');

    await mainPageTest.charts.createChart();
    await mainPageTest.sidebar.toggleChannel('Reactive Power ()', 'test1');

    await mainPageTest.sidebar.closeChannelFile('test1');

    await mainPageTest.charts.expectTitleHeadingVisible('Chart 1');
    await mainPageTest.charts.expectTitleHeadingVisible('Active Power');
    await mainPageTest.charts.expectTitleHeadingVisible('Chart 3');

    await mainPageTest.charts.expectSeriesCount('Chart 1', 0);
    await mainPageTest.charts.expectSeriesCount('Active Power', 1);
    await mainPageTest.charts.expectSeriesCount('Chart 3', 0);
  });
});
