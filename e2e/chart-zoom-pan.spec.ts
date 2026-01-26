import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Chart zoom, pan, and reset controls', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
    await mainPageTest.openChannelFileAndExpandInSidebar('test3.json');
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('shows zoom, pan, and reset buttons on chart', async () => {
    const chartTitle = await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.charts.expectZoomControlsVisible(chartTitle);
  });

  test('zoom mode is enabled by default', async () => {
    const chartTitle = await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);
  });

  test('can toggle between zoom and pan modes', async () => {
    const chartTitle = await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);

    await mainPageTest.charts.clickPanMode(chartTitle);
    await mainPageTest.charts.expectPanModeActive(chartTitle, true);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, false);

    await mainPageTest.charts.clickZoomMode(chartTitle);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);
  });

  test('can perform zoom in by dragging right', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);
    await mainPageTest.charts.waitForChartData(chartTitle);
    await mainPageTest.charts.clickZoomMode(chartTitle);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);

    const initialRanges = await mainPageTest.charts.getZoomRanges(chartTitle);
    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.3,
      startY: 0.5,
      endX: 0.7,
      endY: 0.7,
    });
    await mainPageTest.charts.expectZoomedIn(chartTitle, initialRanges);
  });

  test('can reset zoom using reset button', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);
    await mainPageTest.charts.waitForChartData(chartTitle);
    await mainPageTest.charts.clickZoomMode(chartTitle);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);

    const initialRanges = await mainPageTest.charts.getZoomRanges(chartTitle);

    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.3,
      startY: 0.5,
      endX: 0.7,
      endY: 0.7,
    });
    await mainPageTest.charts.expectZoomedIn(chartTitle, initialRanges);

    await mainPageTest.charts.clickResetZoom(chartTitle);
    await mainPageTest.charts.expectZoomReset(chartTitle, initialRanges);
  });

  test('can reset zoom X using reset X button', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);
    await mainPageTest.charts.waitForChartData(chartTitle);
    await mainPageTest.charts.clickZoomMode(chartTitle);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);

    const initialRanges = await mainPageTest.charts.getZoomRanges(chartTitle);

    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.3,
      startY: 0.5,
      endX: 0.7,
      endY: 0.7,
    });
    await mainPageTest.charts.expectZoomedInBothAxes(chartTitle, initialRanges);

    await mainPageTest.charts.clickResetZoomX(chartTitle);
    await mainPageTest.charts.expectZoomResetX(chartTitle, initialRanges);
  });

  test('can reset zoom Y using reset Y button', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);
    await mainPageTest.charts.waitForChartData(chartTitle);
    await mainPageTest.charts.clickZoomMode(chartTitle);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);

    const initialRanges = await mainPageTest.charts.getZoomRanges(chartTitle);

    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.3,
      startY: 0.5,
      endX: 0.7,
      endY: 0.7,
    });
    await mainPageTest.charts.expectZoomedInBothAxes(chartTitle, initialRanges);

    await mainPageTest.charts.clickResetZoomY(chartTitle);
    await mainPageTest.charts.expectZoomResetY(chartTitle, initialRanges);
  });

  test('can pan chart in pan mode', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);
    await mainPageTest.charts.waitForChartData(chartTitle);
    await mainPageTest.charts.clickZoomMode(chartTitle);
    await mainPageTest.charts.expectZoomModeActive(chartTitle, true);

    const initialRanges = await mainPageTest.charts.getZoomRanges(chartTitle);
    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.3,
      startY: 0.5,
      endX: 0.7,
      endY: 0.7,
    });
    await mainPageTest.charts.expectZoomedIn(chartTitle, initialRanges);
    const zoomedRanges = await mainPageTest.charts.getZoomRanges(chartTitle);

    await mainPageTest.charts.clickPanMode(chartTitle);
    await mainPageTest.charts.expectPanModeActive(chartTitle, true);

    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.5,
      startY: 0.5,
      endX: 0.3,
      endY: 0.3,
    });

    await mainPageTest.charts.expectPanned(chartTitle, zoomedRanges);
  });

  test('can toggle tooltip visibility on chart', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);

    await mainPageTest.charts.expectTooltipToggleVisible(chartTitle, 'hide');

    await mainPageTest.charts.expectTooltipState(chartTitle, {
      show: true,
      axisPointerTriggersTooltip: true,
    });

    await mainPageTest.charts.clickHideTooltip(chartTitle);
    await mainPageTest.charts.expectTooltipToggleVisible(chartTitle, 'show');
    await mainPageTest.charts.expectTooltipState(chartTitle, {
      show: false,
      axisPointerTriggersTooltip: false,
    });

    await mainPageTest.charts.clickShowTooltip(chartTitle);
    await mainPageTest.charts.expectTooltipToggleVisible(chartTitle, 'hide');
    await mainPageTest.charts.expectTooltipState(chartTitle, {
      show: true,
      axisPointerTriggersTooltip: true,
    });
  });

  test('can toggle tooltip with H shortcut', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');
    const chartTitle = 'Voltage';
    await mainPageTest.charts.expectSelectedChart(chartTitle);

    await mainPageTest.charts.expectTooltipToggleVisible(chartTitle, 'hide');

    await mainPageTest.charts.pressTooltipShortcut();
    await mainPageTest.charts.expectTooltipToggleVisible(chartTitle, 'show');
    await mainPageTest.charts.expectTooltipState(chartTitle, {
      show: false,
      axisPointerTriggersTooltip: false,
    });

    await mainPageTest.charts.pressTooltipShortcut();
    await mainPageTest.charts.expectTooltipToggleVisible(chartTitle, 'hide');
    await mainPageTest.charts.expectTooltipState(chartTitle, {
      show: true,
      axisPointerTriggersTooltip: true,
    });
  });

  test('chart activation still works after zoom/pan implementation', async () => {
    const firstChartTitle = await mainPageTest.charts.createChart();
    const secondChartTitle = await mainPageTest.charts.createChart();

    await mainPageTest.charts.expectSelectedChart(secondChartTitle);

    await mainPageTest.charts.selectChartByTitle(firstChartTitle);
    await mainPageTest.charts.expectSelectedChart(firstChartTitle);

    await mainPageTest.charts.selectChartByTitle(secondChartTitle);
    await mainPageTest.charts.expectSelectedChart(secondChartTitle);

    await mainPageTest.charts.clickChartContainer(secondChartTitle);
    await mainPageTest.charts.expectSelectedChart(secondChartTitle);
  });

  test('dragging to zoom keeps the chart selected', async () => {
    const chartTitle = await mainPageTest.charts.createChart();
    await mainPageTest.charts.expectSelectedChart(chartTitle);

    await mainPageTest.charts.dragOnChartByPercent(chartTitle, {
      startX: 0.3,
      startY: 0.5,
      endX: 0.6,
      endY: 0.7,
    });

    await mainPageTest.charts.expectSelectedChart(chartTitle);
  });
});
