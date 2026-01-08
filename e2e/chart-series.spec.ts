import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

import { chartContainer } from './support/chartContainer';
import { chartTitleButton } from './support/chartTitleButton';
import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createAndSelectChart } from './support/createAndSelectChart';
import { createChart } from './support/createChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { openFixtureAndExpandInSidebar } from './support/openFixtureAndExpandInSidebar';
import { selectChartByTitle } from './support/selectChartByTitle';
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

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart channel selection', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('adds the Voltage serie to the selected chart', async () => {
    const channelTitle = 'Voltage (V)';
    const channelChartTitle = 'Voltage';
    await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, channelTitle);
    await expectSelectedChart(mainPage, channelChartTitle);

    await expectChartSeries(mainPage, channelChartTitle, [expectedVoltageSummary]);
  });

  test('adds the Frequency serie to the selected chart', async () => {
    const channelTitle = 'Frequency (Hz)';
    const channelChartTitle = 'Frequency';
    await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, channelTitle);
    await expectSelectedChart(mainPage, channelChartTitle);

    await expectChartSeries(mainPage, channelChartTitle, [expectedFrequencySummary]);
  });

  test('allows selecting both series on the same chart', async () => {
    const channelTitle = 'Voltage (V)';
    const channelChartTitle = 'Voltage';
    await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, channelTitle);
    await expectSelectedChart(mainPage, channelChartTitle);
    await expectChartSeries(mainPage, channelChartTitle, [expectedVoltageSummary]);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChart(mainPage, channelChartTitle);

    await expectChartSeries(mainPage, channelChartTitle, [
      expectedVoltageSummary,
      expectedFrequencySummary,
    ]);
  });

  test('allows switching the selected serie within a chart', async () => {
    const channelTitle = 'Voltage (V)';
    const channelChartTitle = 'Voltage';
    await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, channelTitle);
    await expectChartSeries(mainPage, channelChartTitle, [expectedVoltageSummary]);

    await clickSidebarChannel(mainPage, channelTitle);
    await expectSelectedChart(mainPage, channelChartTitle);
    await expectChartSeries(mainPage, channelChartTitle, []);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChart(mainPage, channelChartTitle);
    await expectChartSeries(mainPage, channelChartTitle, [expectedFrequencySummary]);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChart(mainPage, channelChartTitle);
    await expectChartSeries(mainPage, channelChartTitle, []);
  });

  test('keeps channel selections isolated per chart', async () => {
    const channelTitleFirstChart = 'Voltage (V)';
    const channelChartTitleFirstChart = 'Voltage';
    await createAndSelectChart(mainPage);
    await clickSidebarChannel(mainPage, channelTitleFirstChart);
    await expectChartSeries(mainPage, channelChartTitleFirstChart, [expectedVoltageSummary]);

    const channelTitleSecondChart = 'Frequency (Hz)';
    const channelChartTitleSecondChart = 'Frequency';
    await createAndSelectChart(mainPage);
    await clickSidebarChannel(mainPage, channelTitleSecondChart);

    await expectChartSeries(mainPage, channelChartTitleFirstChart, [expectedVoltageSummary]);
    await expectChartSeries(mainPage, channelChartTitleSecondChart, [expectedFrequencySummary]);
  });

  test('creates new charts from the New Chart button', async () => {
    const firstChartTitle = await createChart(mainPage);
    await expect(chartTitleButton(mainPage, firstChartTitle)).toHaveText(firstChartTitle);

    const secondChartTitle = await createChart(mainPage);

    await expect(chartTitleButton(mainPage, secondChartTitle)).toHaveText(secondChartTitle);
    await expect(mainPage.locator('.echarts-for-react')).toHaveCount(2);
  });

  test('switches the selected chart when clicking different charts', async () => {
    const firstChartTitle = await createChart(mainPage);
    const secondChartTitle = await createChart(mainPage);

    await selectChartByTitle(mainPage, firstChartTitle);
    await expectSelectedChart(mainPage, firstChartTitle);

    await selectChartByTitle(mainPage, secondChartTitle);
    await expectSelectedChart(mainPage, secondChartTitle);

    await chartContainer(mainPage, secondChartTitle).click();
    await expectSelectedChart(mainPage, secondChartTitle);
  });
});

type RenderedSerieSummary = {
  name: string;
  dataLength: number;
  firstPoint: [number, number] | null;
  lastPoint: [number, number] | null;
};

function buildSerieSummary(serie: ChartSerie): RenderedSerieSummary {
  return {
    name: serie.name,
    dataLength: serie.data.length,
    firstPoint: serie.data[0] ?? null,
    lastPoint: serie.data.at(-1) ?? null,
  };
}

async function expectChartSeries(
  page: Page,
  chartTitle: string,
  expectedSeries: {
    name: string;
    dataLength: number;
    firstPoint: [number, number] | null;
    lastPoint: [number, number] | null;
  }[],
) {
  await expect
    .poll(
      async () => {
        const actual = await getRenderedSeriesSummary(page, chartTitle);
        return actual;
      },
      { timeout: 10000 },
    )
    .toEqual(expectedSeries);
}
