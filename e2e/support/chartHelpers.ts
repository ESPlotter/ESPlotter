import { expect, Page } from '@playwright/test';

export async function getSelectedChartTitle(page: Page): Promise<string | null> {
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

export async function expectSelectedChart(page: Page, expectedTitle: string | null): Promise<void> {
  await expect.poll(async () => await getSelectedChartTitle(page)).toBe(expectedTitle);
}

export async function getChartIndex(page: Page, chartTitle: string): Promise<number> {
  const chartTitles = await getChartTitles(page);
  const index = chartTitles.indexOf(chartTitle);
  if (index === -1) {
    throw new Error(`Chart with title "${chartTitle}" was not found.`);
  }
  return index;
}

export async function getRenderedSeriesSummary(
  page: Page,
  chartTitle: string,
): Promise<
  {
    name: string;
    dataLength: number;
    firstPoint: [number, number] | null;
    lastPoint: [number, number] | null;
  }[]
> {
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
      const rawSeries: ChartLikeSerie[] | undefined =
        seriesProp && seriesProp.length > 0
          ? seriesProp
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

export async function getChartTooltipState(
  page: Page,
  chartTitle: string,
): Promise<{ show: boolean; axisPointerTriggersTooltip: boolean }> {
  const chartIndex = await getChartIndex(page, chartTitle);
  return page.evaluate(
    async ({ chartIndex: idx }) => {
      const containers = Array.from(
        document.querySelectorAll<HTMLDivElement>('.echarts-for-react'),
      );
      const target = containers[idx];
      if (!target) {
        throw new Error('Chart container not found');
      }
      const fiberKey = Object.getOwnPropertyNames(target).find((key: string) =>
        key.startsWith('__reactFiber'),
      );
      const host = target as unknown as Record<string, unknown>;
      const rootFiber = fiberKey ? (host[fiberKey] as FiberNode | null) : null;
      let current: FiberNode | null | undefined = rootFiber;
      let echartsInstance: EChartsInstance | null = null;
      while (current && !echartsInstance) {
        const component = current.stateNode as ReactEChartsComponent | null | undefined;
        if (component?.getEchartsInstance) {
          const instance = component.getEchartsInstance();
          if (instance) {
            echartsInstance = instance;
            break;
          }
        }
        current = current.return;
      }
      if (!echartsInstance) {
        throw new Error('ECharts instance not found');
      }
      const optionFromInstance = echartsInstance.getOption();
      const tooltipOption = Array.isArray(optionFromInstance.tooltip)
        ? optionFromInstance.tooltip[0]
        : optionFromInstance.tooltip;
      const xAxisOption = Array.isArray(optionFromInstance.xAxis)
        ? optionFromInstance.xAxis[0]
        : optionFromInstance.xAxis;
      const yAxisOption = Array.isArray(optionFromInstance.yAxis)
        ? optionFromInstance.yAxis[0]
        : optionFromInstance.yAxis;
      const show = tooltipOption?.show ?? true;
      const xTrigger = xAxisOption?.axisPointer?.triggerTooltip;
      const yTrigger = yAxisOption?.axisPointer?.triggerTooltip;
      const axisPointerTriggersTooltip = (xTrigger ?? true) && (yTrigger ?? true);
      return {
        show,
        axisPointerTriggersTooltip,
      };
    },
    { chartIndex },
  );
}

export function chartContainer(page: Page, chartTitle: string) {
  return page
    .locator('article')
    .filter({ has: chartTitleButton(page, chartTitle) })
    .locator('div.border-2')
    .first();
}

export function chartTitleButton(page: Page, chartTitle: string) {
  return page.getByRole('button', { name: chartTitle });
}

// You must import getChartTitles from its helper
import { getChartTitles } from './getChartTitles';

// Types needed for helpers
export type FiberProps = {
  option?: { series?: unknown };
  series?: unknown;
};
export type FiberNode = {
  memoizedProps?: FiberProps;
  pendingProps?: FiberProps;
  return?: FiberNode | null;
  stateNode?: StateNode | null;
};
export type ChartLikeSerie = {
  name?: unknown;
  data?: unknown;
};
export type EChartsOption = {
  series?: unknown;
  tooltip?: { show?: boolean } | Array<{ show?: boolean }>;
  xAxis?:
    | { axisPointer?: { triggerTooltip?: boolean } }
    | Array<{
        axisPointer?: { triggerTooltip?: boolean };
      }>;
  yAxis?:
    | { axisPointer?: { triggerTooltip?: boolean } }
    | Array<{
        axisPointer?: { triggerTooltip?: boolean };
      }>;
};
export type EChartsInstance = {
  getOption: () => EChartsOption;
};
export type ReactEChartsComponent = {
  getEchartsInstance: () => EChartsInstance | undefined;
};
export type StateNode = {
  getEchartsInstance?: () => EChartsInstance | undefined;
};
