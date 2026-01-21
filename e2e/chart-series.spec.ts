import { test, type ElectronApplication, type Page } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

import type { ChartSerie } from '@renderer/components/Chart/ChartSerie';
import type { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

const timeValues = test3Fixture.x.values as number[];
const [voltageChannel, frequencyChannel] =
  test3Fixture.series as ChannelFileContentSeriePrimitive[];

const expectedVoltageSerie = mapToChartSerie(voltageChannel, timeValues);
const expectedFrequencySerie = mapToChartSerie(frequencyChannel, timeValues);

if (!expectedVoltageSerie || !expectedFrequencySerie) {
  throw new Error('Fixture data is missing required series for E2E assertions.');
}

const expectedVoltageSummary = buildSerieSummary(expectedVoltageSerie);
const expectedFrequencySummary = buildSerieSummary(expectedFrequencySerie);

interface RenderedSerieSummary {
  name: string;
  dataLength: number;
  firstPoint: [number, number] | null;
  lastPoint: [number, number] | null;
}

let electronApp: ElectronApplication;
let mainPage: Page;
let mainPageTest: MainPageTestObject;

test.describe('Chart channel selection', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
    await mainPageTest.openFixtureAndExpandInSidebar('test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('adds the Voltage serie to the selected chart', async () => {
    const channelTitle = 'Voltage (V)';
    const channelChartTitle = 'Voltage';
    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);

    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, [expectedVoltageSummary]);
  });

  test('adds the Frequency serie to the selected chart', async () => {
    const channelTitle = 'Frequency (Hz)';
    const channelChartTitle = 'Frequency';
    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);

    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, [expectedFrequencySummary]);
  });

  test('allows selecting both series on the same chart', async () => {
    const channelTitle = 'Voltage (V)';
    const channelChartTitle = 'Voltage';
    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, [expectedVoltageSummary]);

    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)');
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);

    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, [
      expectedVoltageSummary,
      expectedFrequencySummary,
    ]);
  });

  test('allows switching the selected serie within a chart', async () => {
    const channelTitle = 'Voltage (V)';
    const channelChartTitle = 'Voltage';
    await mainPageTest.charts.createAndSelectChart();

    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, [expectedVoltageSummary]);

    await mainPageTest.sidebar.toggleChannel(channelTitle);
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, []);

    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)');
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, [expectedFrequencySummary]);

    await mainPageTest.sidebar.toggleChannel('Frequency (Hz)');
    await mainPageTest.charts.expectSelectedChart(channelChartTitle);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitle, []);
  });

  test('keeps channel selections isolated per chart', async () => {
    const channelTitleFirstChart = 'Voltage (V)';
    const channelChartTitleFirstChart = 'Voltage';
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel(channelTitleFirstChart);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitleFirstChart, [expectedVoltageSummary]);

    const channelTitleSecondChart = 'Frequency (Hz)';
    const channelChartTitleSecondChart = 'Frequency';
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel(channelTitleSecondChart);

    await mainPageTest.charts.expectSeriesSummary(channelChartTitleFirstChart, [expectedVoltageSummary]);
    await mainPageTest.charts.expectSeriesSummary(channelChartTitleSecondChart, [expectedFrequencySummary]);
  });

  test('creates new charts from the New Chart button', async () => {
    const firstChartTitle = await mainPageTest.charts.createChart();
    await mainPageTest.charts.expectTitleButtonText(firstChartTitle);

    const secondChartTitle = await mainPageTest.charts.createChart();

    await mainPageTest.charts.expectTitleButtonText(secondChartTitle);
    await mainPageTest.charts.expectChartCount(2);
  });

  test('switches the selected chart when clicking different charts', async () => {
    const firstChartTitle = await mainPageTest.charts.createChart();
    const secondChartTitle = await mainPageTest.charts.createChart();

    await mainPageTest.charts.selectChartByTitle(firstChartTitle);
    await mainPageTest.charts.expectSelectedChart(firstChartTitle);

    await mainPageTest.charts.selectChartByTitle(secondChartTitle);
    await mainPageTest.charts.expectSelectedChart(secondChartTitle);

    await mainPageTest.charts.clickChartContainer(secondChartTitle);
    await mainPageTest.charts.expectSelectedChart(secondChartTitle);
  });
});

function buildSerieSummary(serie: ChartSerie): RenderedSerieSummary {
  return {
    name: serie.name,
    dataLength: serie.data.length,
    firstPoint: serie.data[0] ?? null,
    lastPoint: serie.data.at(-1) ?? null,
  };
}
