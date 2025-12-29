import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

import { chartContainer } from './support/chartContainer';
import { chartTitleButton } from './support/chartTitleButton';
import { createChart } from './support/createChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { getChartTitles } from './support/getChartTitles';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerImportMenu } from './support/triggerImportMenu';
import { waitForLastOpenedChannelFileChanged } from './support/waitForLastOpenedChannelFileChanged';

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
    await openAndExpandTest3File(electronApp, mainPage);
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

    await selectChartByTitle(mainPage, secondChartTitle);
    await expectSelectedChart(mainPage, null);
  });
});

type RenderedSerieSummary = {
  name: string;
  dataLength: number;
  firstPoint: [number, number] | null;
  lastPoint: [number, number] | null;
};

type SerieComparisonSnapshot = {
  name: string;
  dataLength: number;
  firstPoint: [number, number] | null;
  lastPoint: [number, number] | null;
};

type FiberProps = {
  option?: { series?: unknown };
  series?: unknown;
};

type FiberNode = {
  memoizedProps?: FiberProps;
  pendingProps?: FiberProps;
  return?: FiberNode | null;
  stateNode?: StateNode | null;
};

type ChartLikeSerie = {
  name?: unknown;
  data?: unknown;
};

type EChartsOption = {
  series?: unknown;
};

type EChartsInstance = {
  getOption: () => EChartsOption;
};

type ReactEChartsComponent = {
  getEchartsInstance: () => EChartsInstance | undefined;
};

type StateNode = {
  getEchartsInstance?: () => EChartsInstance | undefined;
};

function buildSerieSummary(serie: ChartSerie): RenderedSerieSummary {
  return {
    name: serie.name,
    dataLength: serie.data.length,
    firstPoint: serie.data[0] ?? null,
    lastPoint: serie.data.at(-1) ?? null,
  };
}

async function openAndExpandTest3File(app: ElectronApplication, page: Page): Promise<void> {
  await setNextOpenFixturePath(app, 'test3.json');

  const parsedPromise = waitForLastOpenedChannelFileChanged(page);
  await triggerImportMenu(app, page);
  await parsedPromise;

  const fileTrigger = page.getByRole('button', { name: 'test3' });
  await fileTrigger.waitFor({ state: 'visible' });
  await fileTrigger.click();
}

async function createAndSelectChart(page: Page): Promise<string> {
  const chartTitle = await createChart(page);
  await selectChartByTitle(page, chartTitle);
  return chartTitle;
}

async function clickSidebarChannel(page: Page, channelLabel: string): Promise<void> {
  await page
    .locator('[data-sidebar="menu-button"]')
    .filter({ hasText: channelLabel })
    .first()
    .click();
}

async function selectChartByTitle(page: Page, chartTitle: string): Promise<void> {
  const chartLocator = chartContainer(page, chartTitle);
  await chartLocator.waitFor({ state: 'visible' });
  await chartLocator.click();
  await expectSelectedChart(page, chartTitle);
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
    .poll(async () => {
      const actual = await getRenderedSeriesSummary(page, chartTitle);
      return actual;
    })
    .toEqual(expectedSeries);
}

// Removed duplicate expectChartSeries definition (now imported from helpers)

async function getChartIndex(page: Page, chartTitle: string): Promise<number> {
  const chartTitles = await getChartTitles(page);
  const index = chartTitles.indexOf(chartTitle);

  if (index === -1) {
    throw new Error(`Chart with title "${chartTitle}" was not found.`);
  }

  return index;
}

async function getSelectedChartTitle(page: Page): Promise<string | null> {
  const chartTitles = await getChartTitles(page);

  for (const title of chartTitles) {
    const isSelected = await chartContainer(page, title).evaluate((element) =>
      element.className.includes('border-slate-900/35'),
    );

    if (isSelected) {
      return title;
    }
  }

  return null;
}

// Removed duplicate chartContainer and chartTitleButton definitions (now imported from helpers)

function buildComparisonSnapshot(summary: RenderedSerieSummary): SerieComparisonSnapshot {
  return {
    name: summary.name,
    dataLength: summary.dataLength,
    firstPoint: summary.firstPoint ? ([...summary.firstPoint] as [number, number]) : null,
    lastPoint: summary.lastPoint ? ([...summary.lastPoint] as [number, number]) : null,
  };
}
