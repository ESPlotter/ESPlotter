import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

import { createChart } from './support/createChart';
import { getChartTitles } from './support/getChartTitles';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerFileOpenShortcut } from './support/triggerFileOpenShortcut';
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
  await triggerFileOpenShortcut(app, page);
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

  const currentSelected = await getSelectedChartTitle(page);
  const expectedSelectionTitle = currentSelected === chartTitle ? null : chartTitle;

  await chartLocator.click();
  await expectSelectedChart(page, expectedSelectionTitle);
}

async function expectSelectedChart(page: Page, expectedTitle: string | null): Promise<void> {
  await expect.poll(async () => await getSelectedChartTitle(page)).toBe(expectedTitle);
}

async function expectChartSeries(
  page: Page,
  chartTitle: string,
  expected: RenderedSerieSummary[],
): Promise<void> {
  const expectedSnapshot = expected.map(buildComparisonSnapshot);

  await expect
    .poll(async () => {
      const renderedSeries = await getRenderedSeriesSummary(page, chartTitle);
      return renderedSeries.map(buildComparisonSnapshot);
    })
    .toEqual(expectedSnapshot);
}

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

async function getRenderedSeriesSummary(
  page: Page,
  chartTitle: string,
): Promise<RenderedSerieSummary[]> {
  const chartIndex = await getChartIndex(page, chartTitle);

  return page.evaluate(
    async ({ chartIndex: idx }) => {
      const containers = Array.from(
        document.querySelectorAll<HTMLDivElement>('.echarts-for-react'),
      );
      const target = containers[idx];

      if (!target) {
        return [];
      }

      const fiberKey = Object.getOwnPropertyNames(target).find((key: string) =>
        key.startsWith('__reactFiber'),
      );
      const host = target as unknown as Record<string, unknown>;
      const rootFiber = fiberKey ? (host[fiberKey] as FiberNode | null) : null;
      let current: FiberNode | null | undefined = rootFiber;
      let seriesProp: ChartLikeSerie[] | undefined;
      let optionFromProps: EChartsOption | undefined;

      while (current && !optionFromProps) {
        const props = current.memoizedProps ?? current.pendingProps;
        if (!seriesProp && props?.series && Array.isArray(props.series)) {
          seriesProp = props.series as ChartLikeSerie[];
        }
        if (!optionFromProps && props?.option) {
          optionFromProps = props.option as EChartsOption;
          break;
        }
        current = current.return;
      }

      const locateEchartsInstance = (
        node: FiberNode | null | undefined,
      ): EChartsInstance | null => {
        let pointer: FiberNode | null | undefined = node;
        while (pointer) {
          const component = pointer.stateNode as ReactEChartsComponent | null | undefined;
          if (component?.getEchartsInstance) {
            const instance = component.getEchartsInstance();
            if (instance) {
              return instance;
            }
          }
          pointer = pointer.return;
        }
        return null;
      };

      const echartsInstance = locateEchartsInstance(current ?? rootFiber);
      const optionFromInstance = echartsInstance?.getOption();

      const rawSeries: ChartLikeSerie[] | undefined =
        seriesProp && seriesProp.length > 0
          ? seriesProp
          : optionFromInstance?.series && Array.isArray(optionFromInstance.series)
            ? (optionFromInstance.series as ChartLikeSerie[])
            : optionFromProps?.series && Array.isArray(optionFromProps.series)
              ? (optionFromProps.series as ChartLikeSerie[])
              : undefined;

      if (!rawSeries) {
        return [];
      }

      const isPoint = (value: unknown): value is [number, number] => {
        return (
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === 'number' &&
          typeof value[1] === 'number'
        );
      };

      return rawSeries.map((serie) => {
        const rawData = Array.isArray(serie.data) ? serie.data : [];
        const data = rawData.filter(isPoint);
        return {
          name: typeof serie.name === 'string' ? serie.name : '',
          dataLength: data.length,
          firstPoint: data.length > 0 ? data[0] : null,
          lastPoint: data.length > 0 ? data[data.length - 1] : null,
        };
      });
    },
    { chartIndex },
  );
}

function chartContainer(page: Page, chartTitle: string) {
  return page
    .locator('article')
    .filter({ has: chartTitleButton(page, chartTitle) })
    .locator('div.border-2')
    .first();
}

function chartTitleButton(page: Page, chartTitle: string) {
  return page.getByRole('button', { name: chartTitle });
}

function buildComparisonSnapshot(summary: RenderedSerieSummary): SerieComparisonSnapshot {
  return {
    name: summary.name,
    dataLength: summary.dataLength,
    firstPoint: summary.firstPoint ? ([...summary.firstPoint] as [number, number]) : null,
    lastPoint: summary.lastPoint ? ([...summary.lastPoint] as [number, number]) : null,
  };
}
