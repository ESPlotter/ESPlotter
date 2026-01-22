import { expect, type Locator, type Page } from '@playwright/test';

interface RenderedSerieSummary {
  name: string;
  dataLength: number;
  firstPoint: [number, number] | null;
  lastPoint: [number, number] | null;
}

interface ChartTooltipState {
  show: boolean;
  axisPointerTriggersTooltip: boolean;
}

interface AxisRange {
  start: number;
  end: number;
}

interface ZoomRanges {
  xAxis: AxisRange;
  yAxis: AxisRange;
}

interface DragPercent {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  steps?: number;
}

interface FiberProps {
  option?: { series?: unknown };
  series?: unknown;
}

interface FiberNode {
  memoizedProps?: FiberProps;
  pendingProps?: FiberProps;
  return?: FiberNode | null;
  stateNode?: StateNode | null;
  child?: FiberNode | null;
  sibling?: FiberNode | null;
}

interface ChartLikeSerie {
  name?: unknown;
  data?: unknown;
}

interface EChartsOption {
  series?: unknown;
  tooltip?: { show?: boolean } | Array<{ show?: boolean }>;
  xAxis?:
    | { axisPointer?: { triggerTooltip?: boolean } }
    | Array<{ axisPointer?: { triggerTooltip?: boolean } }>;
  yAxis?:
    | { axisPointer?: { triggerTooltip?: boolean } }
    | Array<{ axisPointer?: { triggerTooltip?: boolean } }>;
}

interface EChartsInstance {
  getOption: () => EChartsOption;
}

interface ReactEChartsComponent {
  getEchartsInstance: () => EChartsInstance | undefined;
}

interface StateNode {
  getEchartsInstance?: () => EChartsInstance | undefined;
}

interface DataZoomModel {
  getPercentRange?: () => [number, number] | undefined;
}

interface GlobalModel {
  findComponents: (condition: {
    mainType: string;
    query?: Record<string, unknown>;
  }) => DataZoomModel[];
}

interface EChartsInstanceWithModel {
  getModel?: () => GlobalModel;
}

export class ChartTestObject {
  constructor(private readonly page: Page) {}

  async createChart(): Promise<string> {
    const before = await this.getChartTitles();

    await this.page.getByRole('button', { name: 'New Chart' }).click();

    await expect
      .poll(async () => {
        const titles = await this.getChartTitles();
        return titles.length;
      })
      .toBe(before.length + 1);

    const after = await this.getChartTitles();

    const newChartTitle = after.find((title) => !before.includes(title));
    return newChartTitle ?? after[after.length - 1];
  }

  async createAndSelectChart(): Promise<string> {
    const chartTitle = await this.createChart();
    await this.selectChartByTitle(chartTitle);
    return chartTitle;
  }

  async deleteChart(chartTitle: string): Promise<void> {
    await this.ensureChartToolbarReady(chartTitle);
    await this.getChartDeleteButton(chartTitle).click({ trial: true });
    await this.getChartDeleteButton(chartTitle).click();
  }

  async deleteAllCharts(): Promise<void> {
    await this.getDeleteAllChartsButton().click();
  }

  async pressDeleteChartShortcut(): Promise<void> {
    await this.page.keyboard.press('Delete');
  }

  async pressDeleteAllChartsShortcut(): Promise<void> {
    await this.page.keyboard.press('Shift+Delete');
  }

  async selectChartByTitle(
    chartTitle: string,
    expectedSelection: string | null = chartTitle,
  ): Promise<void> {
    const chartLocator = this.getChartContainer(chartTitle);
    await chartLocator.waitFor({ state: 'visible' });

    const currentSelection = await this.getSelectedChartTitle();
    if (currentSelection !== expectedSelection) {
      await chartLocator.click();
    }

    await this.expectSelectedChart(expectedSelection);
  }

  async getChartTitles(): Promise<string[]> {
    const titles = await this.page
      .getByRole('main')
      .getByRole('article')
      .getByRole('heading', { level: 2 })
      .allTextContents();
    return titles
      .map((title) => title.trim())
      .filter((title) => title.length > 0 && title !== 'New Chart');
  }

  async expectChartTitlesCount(expectedCount: number): Promise<void> {
    await expect.poll(async () => (await this.getChartTitles()).length).toBe(expectedCount);
  }

  async expectChartTitlesEqual(expectedTitles: string[]): Promise<void> {
    await expect.poll(async () => this.getChartTitles()).toEqual(expectedTitles);
  }

  async expectChartTitlesContain(expectedTitles: string[]): Promise<void> {
    const titles = await this.getChartTitles();
    for (const expectedTitle of expectedTitles) {
      expect(titles).toContain(expectedTitle);
    }
  }

  async expectChartTitlesNotContain(unexpectedTitles: string[]): Promise<void> {
    const titles = await this.getChartTitles();
    for (const unexpectedTitle of unexpectedTitles) {
      expect(titles).not.toContain(unexpectedTitle);
    }
  }

  async expectChartTitlesRenumbered(count: number): Promise<void> {
    await expect
      .poll(async () => this.getChartTitles())
      .toEqual(Array.from({ length: count }, (_, index) => `Chart ${index + 1}`));
  }

  async expectTitleHeadingVisible(title: string, index = 0): Promise<void> {
    await expect(this.getChartTitleHeading(title).nth(index)).toBeVisible();
  }

  async expectTitleButtonVisible(title: string): Promise<void> {
    await expect(this.getChartTitleButton(title)).toBeVisible();
  }

  async expectTitleButtonNotVisible(title: string): Promise<void> {
    await expect(this.getChartTitleButton(title)).not.toBeVisible();
  }

  async expectTitleButtonText(title: string): Promise<void> {
    await expect(this.getChartTitleButton(title)).toHaveText(title);
  }

  async renameChartTitle(currentTitle: string, newTitle: string): Promise<void> {
    await this.getChartTitleHeading(currentTitle)
      .getByRole('button', { name: currentTitle })
      .click();
    const input = this.page.getByRole('textbox', { name: /chart name/i });
    await input.fill(newTitle);
    await input.press('Enter');
  }

  async cancelChartRename(currentTitle: string, temporaryTitle: string): Promise<void> {
    await this.getChartTitleHeading(currentTitle)
      .getByRole('button', { name: currentTitle })
      .click();
    const input = this.page.getByRole('textbox', { name: /chart name/i });
    await input.fill(temporaryTitle);
    await input.press('Escape');
  }

  async expectSelectedChart(expectedTitle: string | null): Promise<void> {
    await expect.poll(async () => this.getSelectedChartTitle()).toBe(expectedTitle);
  }

  async getSelectedChartTitle(): Promise<string | null> {
    const chartTitles = await this.getChartTitles();
    for (const title of chartTitles) {
      const isSelected = await this.getChartContainer(title).evaluate((element) =>
        element.className.includes('border-slate-900/35'),
      );
      if (isSelected) {
        return title;
      }
    }
    return null;
  }

  async getRenderedSeriesSummary(chartTitle: string): Promise<RenderedSerieSummary[]> {
    const chartIndex = await this.getChartIndex(chartTitle);
    return this.page.evaluate(
      async ({ chartIndex: idx }) => {
        const chartCards = Array.from(
          document.querySelectorAll<HTMLDivElement>('[data-testid="chart-card"]'),
        );
        const targetCard = chartCards[idx];
        if (!targetCard) {
          return [];
        }

        const fiberKey = Object.getOwnPropertyNames(targetCard).find((key: string) =>
          key.startsWith('__reactFiber'),
        );
        if (!fiberKey) {
          return [];
        }
        const host = targetCard as unknown as Record<string, unknown>;
        const rootFiber = host[fiberKey] as FiberNode | null;
        if (!rootFiber) {
          return [];
        }

        let seriesProp: ChartLikeSerie[] | undefined;
        let optionFromProps: EChartsOption | undefined;
        let echartsInstance: EChartsInstance | null = null;
        const stack: FiberNode[] = [rootFiber];
        while (stack.length > 0) {
          const current = stack.pop();
          if (!current) {
            continue;
          }
          const props = current.memoizedProps ?? current.pendingProps;
          if (!seriesProp && props?.series && Array.isArray(props.series)) {
            seriesProp = props.series as ChartLikeSerie[];
          }
          if (!optionFromProps && props?.option) {
            optionFromProps = props.option as EChartsOption;
          }
          if (!echartsInstance) {
            const component = current.stateNode as ReactEChartsComponent | null | undefined;
            if (component?.getEchartsInstance) {
              const instance = component.getEchartsInstance();
              if (instance) {
                echartsInstance = instance;
              }
            }
          }
          if (current.sibling) {
            stack.push(current.sibling);
          }
          if (current.child) {
            stack.push(current.child);
          }
        }

        const seriesFromProps: ChartLikeSerie[] | undefined =
          seriesProp && seriesProp.length > 0
            ? seriesProp
            : optionFromProps?.series && Array.isArray(optionFromProps.series)
              ? (optionFromProps.series as ChartLikeSerie[])
              : undefined;
        const optionFromInstance = echartsInstance?.getOption?.();
        const seriesFromInstance =
          optionFromInstance?.series && Array.isArray(optionFromInstance.series)
            ? (optionFromInstance.series as ChartLikeSerie[])
            : undefined;
        const rawSeries =
          seriesFromInstance && seriesFromInstance.length > 0
            ? seriesFromInstance
            : seriesFromProps && seriesFromProps.length > 0
              ? seriesFromProps
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

  async expectSeriesSummary(
    chartTitle: string,
    expectedSeries: RenderedSerieSummary[],
  ): Promise<void> {
    await expect
      .poll(async () => this.getRenderedSeriesSummary(chartTitle), { timeout: 10000 })
      .toEqual(expectedSeries);
  }

  async expectSeriesCount(chartTitle: string, expectedCount: number): Promise<void> {
    await expect
      .poll(async () => (await this.getRenderedSeriesSummary(chartTitle)).length, {
        timeout: 10000,
      })
      .toBe(expectedCount);
  }

  async expectSeriesCountGreaterThan(chartTitle: string, expectedCount: number): Promise<void> {
    await expect
      .poll(async () => (await this.getRenderedSeriesSummary(chartTitle)).length, {
        timeout: 10000,
      })
      .toBeGreaterThan(expectedCount);
  }

  async expectSeriesNames(
    chartTitle: string,
    expectedNames: string[],
    options: { sort?: boolean } = {},
  ): Promise<void> {
    await expect
      .poll(async () => {
        const names = (await this.getRenderedSeriesSummary(chartTitle)).map((serie) => serie.name);
        return options.sort === false ? names : names.sort();
      })
      .toEqual(options.sort === false ? expectedNames : [...expectedNames].sort());
  }

  async expectFirstSeriesDataLengthGreaterThan(
    chartTitle: string,
    minLength: number,
  ): Promise<void> {
    await expect
      .poll(async () => {
        const renderedSeries = await this.getRenderedSeriesSummary(chartTitle);
        return renderedSeries.length > 0 ? renderedSeries[0].dataLength : 0;
      })
      .toBeGreaterThan(minLength);
  }

  async waitForChartData(chartTitle: string): Promise<void> {
    await expect
      .poll(
        async () => {
          try {
            const series = await this.getRenderedSeriesSummary(chartTitle);
            if (series.some((serie) => serie.dataLength > 0)) {
              return true;
            }
          } catch {
            // keep polling until chart title resolves
          }

          const chartCard = this.getChartCard(chartTitle);
          const chartMedia = chartCard.locator('canvas,svg');
          const count = await chartMedia.count();
          if (count === 0) {
            return false;
          }

          return chartMedia.first().evaluate((element) => {
            if (element instanceof HTMLCanvasElement) {
              return element.width > 0 && element.height > 0;
            }
            return element.getBoundingClientRect().width > 0;
          });
        },
        { timeout: 10000 },
      )
      .toBe(true);
  }

  async getTooltipState(chartTitle: string): Promise<ChartTooltipState> {
    const chartIndex = await this.getChartIndex(chartTitle);
    return this.page.evaluate(
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

  async expectTooltipState(chartTitle: string, expectedState: ChartTooltipState): Promise<void> {
    await expect.poll(async () => this.getTooltipState(chartTitle)).toEqual(expectedState);
  }

  async clickHideTooltip(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle)
      .getByTitle(/Hide tooltip/)
      .click();
  }

  async clickShowTooltip(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle)
      .getByTitle(/Show tooltip/)
      .click();
  }

  async expectTooltipToggleVisible(chartTitle: string, state: 'show' | 'hide'): Promise<void> {
    const title = state === 'show' ? /Show tooltip/ : /Hide tooltip/;
    await expect(this.getChartRoot(chartTitle).getByTitle(title)).toBeVisible();
  }

  async pressTooltipShortcut(): Promise<void> {
    await this.page.keyboard.press('h');
  }

  async expectZoomControlsVisible(chartTitle: string): Promise<void> {
    const chartRoot = this.getChartRoot(chartTitle);
    await expect(chartRoot.getByTitle(/Zoom mode/)).toBeVisible();
    await expect(chartRoot.getByTitle(/Pan mode/)).toBeVisible();
    await expect(chartRoot.getByRole('button', { name: 'Reset zoom', exact: true })).toBeVisible();
  }

  async clickPanMode(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle)
      .getByTitle(/Pan mode/)
      .click();
  }

  async clickZoomMode(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle)
      .getByTitle(/Zoom mode/)
      .click();
  }

  async clickResetZoom(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle)
      .getByRole('button', { name: 'Reset zoom', exact: true })
      .click();
  }

  async clickResetZoomX(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle).getByRole('button', { name: 'Reset zoom X' }).click();
  }

  async clickResetZoomY(chartTitle: string): Promise<void> {
    await this.getChartRoot(chartTitle).getByRole('button', { name: 'Reset zoom Y' }).click();
  }

  async expectZoomModeActive(chartTitle: string, active = true): Promise<void> {
    await this.expectButtonActive(this.getChartRoot(chartTitle).getByTitle(/Zoom mode/), active);
  }

  async expectPanModeActive(chartTitle: string, active = true): Promise<void> {
    await this.expectButtonActive(this.getChartRoot(chartTitle).getByTitle(/Pan mode/), active);
  }

  async dragOnChartByPercent(chartTitle: string, drag: DragPercent): Promise<void> {
    const chartElement = this.getChartElement(chartTitle);
    await expect(chartElement).toBeVisible();
    const box = await chartElement.boundingBox();
    if (!box) {
      throw new Error('Chart element not found');
    }

    const startX = box.x + box.width * drag.startX;
    const startY = box.y + box.height * drag.startY;
    const endX = box.x + box.width * drag.endX;
    const endY = box.y + box.height * drag.endY;
    const steps = drag.steps ?? 10;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps });
    await this.page.mouse.up();
  }

  async getZoomRanges(chartTitle: string): Promise<ZoomRanges> {
    const chartIndex = await this.getChartIndex(chartTitle);

    return this.page.evaluate(
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

        let current: FiberNode | null = rootFiber;
        let echartsInstance: ReactEChartsComponent | null = null;

        while (current && !echartsInstance) {
          const component = current.stateNode as ReactEChartsComponent | null | undefined;
          if (component?.getEchartsInstance) {
            const instance = component.getEchartsInstance();
            if (instance) {
              echartsInstance = component;
              break;
            }
          }
          current = current.return ?? null;
        }

        if (!echartsInstance) {
          throw new Error('ECharts instance not found');
        }

        const instance = echartsInstance.getEchartsInstance();
        if (!instance) {
          throw new Error('ECharts instance not available');
        }

        const model = (instance as unknown as EChartsInstanceWithModel).getModel?.();
        if (!model) {
          throw new Error('ECharts model not available');
        }
        const resolvedModel = model;

        function getRange(id: string): AxisRange {
          const zoomModels = resolvedModel.findComponents({
            mainType: 'dataZoom',
            query: { dataZoomId: id },
          });
          const zoomModel = zoomModels[0] as DataZoomModel | undefined;
          const percentRange = zoomModel?.getPercentRange?.();
          if (percentRange && percentRange.length === 2) {
            return {
              start: typeof percentRange[0] === 'number' ? percentRange[0] : 0,
              end: typeof percentRange[1] === 'number' ? percentRange[1] : 100,
            };
          }
          return { start: 0, end: 100 };
        }

        return {
          xAxis: getRange('datazoom-inside-x'),
          yAxis: getRange('datazoom-inside-y'),
        };
      },
      { chartIndex },
    );
  }

  async expectZoomedIn(chartTitle: string, initialRanges: ZoomRanges): Promise<void> {
    await expect
      .poll(async () => {
        const zoomedRanges = await this.getZoomRanges(chartTitle);
        return (
          zoomedRanges.xAxis.start > initialRanges.xAxis.start &&
          zoomedRanges.xAxis.end < initialRanges.xAxis.end
        );
      })
      .toBe(true);
  }

  async expectZoomedInBothAxes(chartTitle: string, initialRanges: ZoomRanges): Promise<void> {
    await expect
      .poll(async () => {
        const zoomedRanges = await this.getZoomRanges(chartTitle);
        return (
          zoomedRanges.xAxis.start > initialRanges.xAxis.start &&
          zoomedRanges.xAxis.end < initialRanges.xAxis.end &&
          Math.abs(zoomedRanges.yAxis.start - initialRanges.yAxis.start) > 0.1 &&
          Math.abs(zoomedRanges.yAxis.end - initialRanges.yAxis.end) > 0.1
        );
      })
      .toBe(true);
  }

  async expectZoomReset(chartTitle: string, initialRanges: ZoomRanges): Promise<void> {
    await expect
      .poll(async () => {
        const resetRanges = await this.getZoomRanges(chartTitle);
        return (
          Math.abs(resetRanges.xAxis.start - initialRanges.xAxis.start) < 0.1 &&
          Math.abs(resetRanges.xAxis.end - initialRanges.xAxis.end) < 0.1 &&
          Math.abs(resetRanges.yAxis.start - initialRanges.yAxis.start) < 0.1 &&
          Math.abs(resetRanges.yAxis.end - initialRanges.yAxis.end) < 0.1
        );
      })
      .toBe(true);
  }

  async expectZoomResetX(chartTitle: string, initialRanges: ZoomRanges): Promise<void> {
    await expect
      .poll(async () => {
        const resetRanges = await this.getZoomRanges(chartTitle);
        return (
          Math.abs(resetRanges.xAxis.start - initialRanges.xAxis.start) < 0.1 &&
          Math.abs(resetRanges.xAxis.end - initialRanges.xAxis.end) < 0.1 &&
          Math.abs(resetRanges.yAxis.start - initialRanges.yAxis.start) > 0.1 &&
          Math.abs(resetRanges.yAxis.end - initialRanges.yAxis.end) > 0.1
        );
      })
      .toBe(true);
  }

  async expectZoomResetY(chartTitle: string, initialRanges: ZoomRanges): Promise<void> {
    await expect
      .poll(async () => {
        const resetRanges = await this.getZoomRanges(chartTitle);
        return (
          Math.abs(resetRanges.yAxis.start - initialRanges.yAxis.start) < 0.1 &&
          Math.abs(resetRanges.yAxis.end - initialRanges.yAxis.end) < 0.1 &&
          Math.abs(resetRanges.xAxis.start - initialRanges.xAxis.start) > 0.1 &&
          Math.abs(resetRanges.xAxis.end - initialRanges.xAxis.end) > 0.1
        );
      })
      .toBe(true);
  }

  async expectPanned(chartTitle: string, zoomedRanges: ZoomRanges): Promise<void> {
    const zoomedRangeX = zoomedRanges.xAxis.end - zoomedRanges.xAxis.start;
    await expect
      .poll(async () => {
        const pannedRanges = await this.getZoomRanges(chartTitle);
        const pannedRangeX = pannedRanges.xAxis.end - pannedRanges.xAxis.start;
        return (
          Math.abs(pannedRangeX - zoomedRangeX) < 0.5 &&
          Math.abs(pannedRanges.xAxis.start - zoomedRanges.xAxis.start) > 0.1
        );
      })
      .toBe(true);
  }

  async clickChartContainer(chartTitle: string): Promise<void> {
    await this.getChartContainer(chartTitle).click();
  }

  async expectChartCount(count: number): Promise<void> {
    await expect(this.page.locator('.echarts-for-react')).toHaveCount(count);
  }

  async copyChartImage(chartTitle: string): Promise<void> {
    await this.getChartCard(chartTitle).getByTitle('Copy chart image').click();
  }

  async pressCopyChartShortcut(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.keyboard.press('s');
  }

  async pressCopyVisibleChartsShortcut(): Promise<void> {
    await this.page.keyboard.press('Shift+S');
  }

  async expectCopyVisibleChartsButtonVisible(): Promise<void> {
    await expect(this.getCopyVisibleChartsButton()).toBeVisible();
  }

  async expectCopyVisibleChartsButtonHidden(): Promise<void> {
    await expect(this.getCopyVisibleChartsButton()).toHaveCount(0);
  }

  async copyVisibleCharts(): Promise<void> {
    await this.getCopyVisibleChartsButton().click();
  }

  async scrollChartGridToBottomIfNeeded(): Promise<void> {
    const scrollContainer = this.getScrollContainer();
    const sizes = await scrollContainer.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));

    if (sizes.scrollHeight > sizes.clientHeight) {
      await scrollContainer.evaluate((element) => {
        element.scrollTop = element.clientHeight;
      });
    }
  }

  async getChartGridSize(): Promise<{ width: number; height: number }> {
    return this.getScrollContainer().evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
  }

  async expectNewChartButtonVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'New Chart' })).toBeVisible();
  }

  private async expectButtonActive(locator: Locator, active: boolean): Promise<void> {
    if (active) {
      await expect(locator).toHaveClass(/bg-primary/);
      return;
    }
    await expect(locator).not.toHaveClass(/bg-primary/);
  }

  private getChartTitleHeading(chartTitle: string): Locator {
    return this.getChartCardByTitle(chartTitle).getByRole('heading', {
      level: 2,
      name: chartTitle,
    });
  }

  private getChartTitleButton(chartTitle: string): Locator {
    return this.getChartTitleHeading(chartTitle).getByRole('button', { name: chartTitle });
  }

  private getChartRoot(chartTitle: string): Locator {
    return this.getChartCardByTitle(chartTitle);
  }

  private getChartCard(chartTitle: string): Locator {
    return this.getChartCardByTitle(chartTitle);
  }

  private getChartCardByTitle(chartTitle: string): Locator {
    return this.page
      .getByTestId('chart-card')
      .filter({ has: this.page.getByRole('button', { name: chartTitle }) });
  }

  private getChartContainer(chartTitle: string): Locator {
    return this.getChartRoot(chartTitle).locator('div.border-2').first();
  }

  private getChartElement(chartTitle: string): Locator {
    return this.getChartContainer(chartTitle).locator('.echarts-for-react').first();
  }

  private getCopyVisibleChartsButton(): Locator {
    return this.page.getByRole('button', { name: 'Copy visible charts' });
  }

  private getScrollContainer(): Locator {
    return this.page.getByTestId('chart-scroll-container');
  }

  private getDeleteAllChartsButton(): Locator {
    return this.page
      .getByRole('main')
      .getByRole('button', { name: 'Delete all charts (Ctrl+Delete)' });
  }

  private async ensureChartToolbarReady(chartTitle: string): Promise<void> {
    const chartCard = this.getChartCardByTitle(chartTitle);
    await chartCard.waitFor({ state: 'visible' });

    const zoomButton = chartCard.getByRole('button', { name: 'Zoom mode' });
    await zoomButton.waitFor({ state: 'visible' });
    await zoomButton.scrollIntoViewIfNeeded();

    await chartCard.hover();
    await this.page.waitForTimeout(50);
  }

  private getChartDeleteButton(chartTitle: string): Locator {
    return this.getChartCardByTitle(chartTitle).getByRole('button', {
      name: 'Delete chart (Delete key)',
    });
  }

  private async getChartIndex(chartTitle: string): Promise<number> {
    const chartTitles = await this.getChartTitles();
    const index = chartTitles.indexOf(chartTitle);
    if (index === -1) {
      throw new Error(`Chart with title "${chartTitle}" was not found.`);
    }
    return index;
  }
}
