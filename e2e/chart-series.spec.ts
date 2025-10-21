import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

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
    const chartId = await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, 'Voltage (V)');
    await expectSelectedChartId(mainPage, chartId);

    await expectChartSeries(mainPage, chartId, [expectedVoltageSummary]);
  });

  test('adds the Frequency serie to the selected chart', async () => {
    const chartId = await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChartId(mainPage, chartId);

    await expectChartSeries(mainPage, chartId, [expectedFrequencySummary]);
  });

  test('allows selecting both series on the same chart', async () => {
    const chartId = await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, 'Voltage (V)');
    await expectSelectedChartId(mainPage, chartId);
    await expectChartSeries(mainPage, chartId, [expectedVoltageSummary]);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChartId(mainPage, chartId);

    await expectChartSeries(mainPage, chartId, [expectedVoltageSummary, expectedFrequencySummary]);
  });

  test('allows switching the selected serie within a chart', async () => {
    const chartId = await createAndSelectChart(mainPage);

    await clickSidebarChannel(mainPage, 'Voltage (V)');
    await expectChartSeries(mainPage, chartId, [expectedVoltageSummary]);

    await clickSidebarChannel(mainPage, 'Voltage (V)');
    await expectSelectedChartId(mainPage, chartId);
    await expectChartSeries(mainPage, chartId, []);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChartId(mainPage, chartId);
    await expectChartSeries(mainPage, chartId, [expectedFrequencySummary]);

    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectSelectedChartId(mainPage, chartId);
    await expectChartSeries(mainPage, chartId, []);
  });

  test('keeps channel selections isolated per chart', async () => {
    const firstChartId = await createAndSelectChart(mainPage);
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    await expectChartSeries(mainPage, firstChartId, [expectedVoltageSummary]);

    const secondChartId = await createAndSelectChart(mainPage);
    await clickSidebarChannel(mainPage, 'Frequency (Hz)');
    await expectChartSeries(mainPage, secondChartId, [expectedFrequencySummary]);

    await expectChartSeries(mainPage, firstChartId, [expectedVoltageSummary]);
  });

  test('creates new charts from the New Chart button', async () => {
    const firstChartId = await createChart(mainPage);
    await expect(mainPage.getByRole('heading', { name: new RegExp(firstChartId) })).toBeVisible();

    const secondChartId = await createChart(mainPage);

    await expect(mainPage.getByRole('heading', { name: new RegExp(secondChartId) })).toBeVisible();
    await expect(mainPage.locator('.echarts-for-react')).toHaveCount(2);
  });

  test('switches the selected chart when clicking different charts', async () => {
    const firstChartId = await createChart(mainPage);
    const secondChartId = await createChart(mainPage);

    await selectChartById(mainPage, firstChartId);
    await expectSelectedChartId(mainPage, firstChartId);

    await selectChartById(mainPage, secondChartId);
    await expectSelectedChartId(mainPage, secondChartId);

    await selectChartById(mainPage, secondChartId);
    await expectSelectedChartId(mainPage, null);
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
  const chartId = await createChart(page);
  await selectChartById(page, chartId);
  return chartId;
}

async function createChart(page: Page): Promise<string> {
  const before = await getChartIds(page);

  await page.getByRole('button', { name: 'New Chart' }).click();

  const headingsLocator = page.locator('h2', { hasText: /^Chart ID:/ });
  await expect(headingsLocator).toHaveCount(before.length + 1);

  const after = await getChartIds(page);

  const newChartId = after.find((id) => !before.includes(id));
  return newChartId ?? after[after.length - 1];
}

async function clickSidebarChannel(page: Page, channelLabel: string): Promise<void> {
  await page.getByRole('button', { name: channelLabel }).click();
}

async function selectChartById(page: Page, chartId: string): Promise<void> {
  const chartLocator = chartContainer(page, chartId);

  await chartLocator.waitFor({ state: 'visible' });

  const currentSelected = await getSelectedChartId(page);
  const expectedSelection = currentSelected === chartId ? null : chartId;

  await chartLocator.click();
  await expectSelectedChartId(page, expectedSelection);
}

async function expectSelectedChartId(page: Page, expectedId: string | null): Promise<void> {
  await expect.poll(async () => await getSelectedChartId(page)).toBe(expectedId);
}

async function expectChartSeries(
  page: Page,
  chartId: string,
  expected: RenderedSerieSummary[],
): Promise<void> {
  const expectedSnapshot = expected.map(buildComparisonSnapshot);

  await expect
    .poll(async () => {
      const renderedSeries = await getRenderedSeriesSummary(page, chartId);
      return renderedSeries.map(buildComparisonSnapshot);
    })
    .toEqual(expectedSnapshot);
}

async function getChartIndex(page: Page, chartId: string): Promise<number> {
  const chartIds = await getChartIds(page);
  const index = chartIds.indexOf(chartId);

  if (index === -1) {
    throw new Error(`Chart with id ${chartId} was not found.`);
  }

  return index;
}

async function getChartIds(page: Page): Promise<string[]> {
  const texts = await page.locator('h2', { hasText: /^Chart ID:/ }).allTextContents();
  return texts.map((text) => text.replace('Chart ID:', '').trim());
}

async function getSelectedChartId(page: Page): Promise<string | null> {
  const chartIds = await getChartIds(page);

  for (const id of chartIds) {
    const isSelected = await chartContainer(page, id).evaluate((element) =>
      element.className.includes('border-slate-900/35'),
    );

    if (isSelected) {
      return id;
    }
  }

  return null;
}

async function getRenderedSeriesSummary(
  page: Page,
  chartId: string,
): Promise<RenderedSerieSummary[]> {
  const chartIndex = await getChartIndex(page, chartId);

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

function chartSection(page: Page, chartId: string) {
  return page
    .locator('div.p-4.w-full')
    .filter({ has: page.getByRole('heading', { name: `Chart ID: ${chartId}` }) });
}

function chartContainer(page: Page, chartId: string) {
  return chartSection(page, chartId).locator('div.border-2').first();
}

function buildComparisonSnapshot(summary: RenderedSerieSummary): SerieComparisonSnapshot {
  return {
    name: summary.name,
    dataLength: summary.dataLength,
    firstPoint: summary.firstPoint ? ([...summary.firstPoint] as [number, number]) : null,
    lastPoint: summary.lastPoint ? ([...summary.lastPoint] as [number, number]) : null,
  };
}
