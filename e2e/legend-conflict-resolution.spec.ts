import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Legend names with conflicts from different channels file', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('shows channel names without test names when no conflicts exist', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test2.json', 'test2');
    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)');

    await mainPageTest.charts.expectSeriesNames('Voltage', ['Frequency', 'Voltage']);
  });

  test('appends test names when same channel from different tests are added', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test2.json', 'test2');
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');

    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test2');
    await mainPageTest.charts.expectSeriesNames('Voltage', ['Voltage'], { sort: false });

    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test3');
    await mainPageTest.charts.expectSeriesNames('Voltage', ['Voltage (test2)', 'Voltage (test3)']);
  });

  test('appends test names to ALL series when ANY conflict exists', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test2.json', 'test2');
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');

    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test2');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test3');
    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)', 'test2');

    await mainPageTest.charts.expectSeriesNames('Voltage', [
      'Frequency (test2)',
      'Voltage (test2)',
      'Voltage (test3)',
    ]);
  });

  test('handles conflicts with both Voltage and Frequency from two tests', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test2.json', 'test2');
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');

    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test2');
    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)', 'test2');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test3');
    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)', 'test3');

    await mainPageTest.charts.expectSeriesNames('Voltage', [
      'Frequency (test2)',
      'Frequency (test3)',
      'Voltage (test2)',
      'Voltage (test3)',
    ]);
  });

  test('resolves conflicts when channel is removed', async () => {
    await mainPageTest.openFixtureAndExpandInSidebar('test2.json', 'test2');
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');

    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test2');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test3');

    await mainPageTest.charts.expectSeriesNames('Voltage', ['Voltage (test2)', 'Voltage (test3)']);

    await mainPageTest.sidebar.toggleChannel('Voltage (V)', 'test3');

    await mainPageTest.charts.expectSeriesNames('Voltage', ['Voltage'], { sort: false });
  });
});
