import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { chartContainer } from './support/chartContainer';
import { chartTitleButton } from './support/chartTitleButton';
import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createAndSelectChart } from './support/createAndSelectChart';
import { createChart } from './support/createChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { getChartIndex } from './support/getChartIndex';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { openFixtureAndExpandInSidebar } from './support/openFixtureAndExpandInSidebar';
import { selectChartByTitle } from './support/selectChartByTitle';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

import type { FiberNode, ReactEChartsComponent } from './support/chartHelpers';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart zoom, pan, and reset controls', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows zoom, pan, and reset buttons on chart', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    const chartRoot = getChartRoot(mainPage, chartTitle);

    // Check for zoom button (should be highlighted by default)
    const zoomButton = chartRoot.getByTitle(/Zoom mode/);
    await expect(zoomButton).toBeVisible();

    // Check for pan button
    const panButton = chartRoot.getByTitle(/Pan mode/);
    await expect(panButton).toBeVisible();

    // Check for reset button
    const resetButton = chartRoot.getByTitle(/Reset zoom/);
    await expect(resetButton).toBeVisible();
  });

  test('zoom mode is enabled by default', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    const chartRoot = getChartRoot(mainPage, chartTitle);

    const zoomButton = chartRoot.getByTitle(/Zoom mode/);

    // Zoom button should have default variant (highlighted)
    await expect(zoomButton).toHaveClass(/bg-primary/);
  });

  test('can toggle between zoom and pan modes', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    const chartRoot = getChartRoot(mainPage, chartTitle);

    const zoomButton = chartRoot.getByTitle(/Zoom mode/);
    const panButton = chartRoot.getByTitle(/Pan mode/);

    // Initially zoom is active
    await expect(zoomButton).toHaveClass(/bg-primary/);

    // Click pan button
    await panButton.click();

    // Pan should now be active, zoom inactive
    await expect(panButton).toHaveClass(/bg-primary/);
    await expect(zoomButton).not.toHaveClass(/bg-primary/);

    // Click zoom button again
    await zoomButton.click();

    // Zoom should be active again
    await expect(zoomButton).toHaveClass(/bg-primary/);
  });

  test('can perform zoom in by dragging right', async () => {
    await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    const chartTitle = 'Voltage';
    await expectSelectedChart(mainPage, chartTitle);

    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();

    await expect(chartElement).toBeVisible();
    await waitForChartData(mainPage, chartTitle);

    // Get initial axis ranges
    const initialRanges = await getChartZoomRanges(mainPage, chartTitle);

    // Perform zoom by dragging from left to right
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    const startX = box.x + box.width * 0.3;
    const startY = box.y + box.height * 0.5;
    const endX = box.x + box.width * 0.7;
    const endY = box.y + box.height * 0.7;

    await mainPage.mouse.move(startX, startY);
    await mainPage.mouse.down();
    await mainPage.mouse.move(endX, endY, { steps: 10 });
    await mainPage.mouse.up();

    // Wait for zoom to be applied
    await expect
      .poll(
        async () => {
          const zoomedRanges = await getChartZoomRanges(mainPage, chartTitle);
          return (
            zoomedRanges.xAxis.start > initialRanges.xAxis.start &&
            zoomedRanges.xAxis.end < initialRanges.xAxis.end
          );
        },
        { timeout: 10000 },
      )
      .toBe(true);
  });

  test('can reset zoom using reset button', async () => {
    await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    const chartTitle = 'Voltage';
    await expectSelectedChart(mainPage, chartTitle);

    const chartRoot = getChartRoot(mainPage, chartTitle);
    const chartElement = chartContainer(mainPage, chartTitle).locator('.echarts-for-react').first();
    const resetButton = chartRoot.getByTitle(/Reset zoom/);

    await expect(chartElement).toBeVisible();
    await waitForChartData(mainPage, chartTitle);

    // Get initial axis ranges
    const initialRanges = await getChartZoomRanges(mainPage, chartTitle);

    // Zoom in
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();
    await expect
      .poll(
        async () => {
          const zoomedRanges = await getChartZoomRanges(mainPage, chartTitle);
          return (
            zoomedRanges.xAxis.start > initialRanges.xAxis.start &&
            zoomedRanges.xAxis.end < initialRanges.xAxis.end
          );
        },
        { timeout: 10000 },
      )
      .toBe(true);

    // Click reset button
    await resetButton.click();
    await expect
      .poll(
        async () => {
          const resetRanges = await getChartZoomRanges(mainPage, chartTitle);
          return (
            Math.abs(resetRanges.xAxis.start - initialRanges.xAxis.start) < 0.1 &&
            Math.abs(resetRanges.xAxis.end - initialRanges.xAxis.end) < 0.1
          );
        },
        { timeout: 10000 },
      )
      .toBe(true);
  });

  test('can pan chart in pan mode', async () => {
    await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    const chartTitle = 'Voltage';
    await expectSelectedChart(mainPage, chartTitle);

    const chartRoot = getChartRoot(mainPage, chartTitle);
    const chartElement = chartContainer(mainPage, chartTitle).locator('.echarts-for-react').first();
    const panButton = chartRoot.getByTitle(/Pan mode/);

    await expect(chartElement).toBeVisible();
    await waitForChartData(mainPage, chartTitle);

    // First zoom in so we can pan
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');
    const initialRanges = await getChartZoomRanges(mainPage, chartTitle);

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();
    await expect
      .poll(
        async () => {
          const zoomedRanges = await getChartZoomRanges(mainPage, chartTitle);
          return (
            zoomedRanges.xAxis.start > initialRanges.xAxis.start &&
            zoomedRanges.xAxis.end < initialRanges.xAxis.end
          );
        },
        { timeout: 10000 },
      )
      .toBe(true);
    const zoomedRanges = await getChartZoomRanges(mainPage, chartTitle);

    // Switch to pan mode
    await panButton.click();
    await expect(panButton).toHaveClass(/bg-primary/);

    // Perform pan by dragging
    await mainPage.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3, { steps: 10 });
    await mainPage.mouse.up();
    const zoomedRangeX = zoomedRanges.xAxis.end - zoomedRanges.xAxis.start;

    await expect
      .poll(
        async () => {
          const pannedRanges = await getChartZoomRanges(mainPage, chartTitle);
          const pannedRangeX = pannedRanges.xAxis.end - pannedRanges.xAxis.start;
          return (
            Math.abs(pannedRangeX - zoomedRangeX) < 0.5 &&
            Math.abs(pannedRanges.xAxis.start - zoomedRanges.xAxis.start) > 0.1
          );
        },
        { timeout: 10000 },
      )
      .toBe(true);
  });

  test('chart activation still works after zoom/pan implementation', async () => {
    const firstChartTitle = await createChart(mainPage);
    const secondChartTitle = await createChart(mainPage);

    // The newest chart should be selected after creation
    await expectSelectedChart(mainPage, secondChartTitle);

    // Selecting another chart still works
    await selectChartByTitle(mainPage, firstChartTitle);
    await expectSelectedChart(mainPage, firstChartTitle);

    // Switching back keeps the selection stable even after repeated clicks
    await selectChartByTitle(mainPage, secondChartTitle);
    await expectSelectedChart(mainPage, secondChartTitle);

    await chartContainer(mainPage, secondChartTitle).click();
    await expectSelectedChart(mainPage, secondChartTitle);
  });

  test('dragging to zoom keeps the chart selected', async () => {
    const chartTitle = await createChart(mainPage);
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();

    await expectSelectedChart(mainPage, chartTitle);

    // Perform a drag (zoom action)
    await expect(chartElement).toBeVisible();
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();

    // Dragging should not clear or change the selection
    await expectSelectedChart(mainPage, chartTitle);
  });
});

// Helper functions
async function addVoltageChannelToChart(page: Page) {
  await clickSidebarChannel(page, 'Voltage (V)');
}

async function waitForChartData(page: Page, chartTitle: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const series = await getRenderedSeriesSummary(page, chartTitle);
        return series.some((serie) => serie.dataLength > 0);
      },
      { timeout: 10000 },
    )
    .toBe(true);
}

async function getChartZoomRanges(page: Page, chartTitle: string): Promise<ZoomRanges> {
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

      // Find ECharts instance
      const fiberKey = Object.getOwnPropertyNames(target).find((key: string) =>
        key.startsWith('__reactFiber'),
      );
      const host = target as unknown as Record<string, unknown>;
      const rootFiber = fiberKey ? (host[fiberKey] as FiberNode | null) : null;

      let current: FiberNode | null = rootFiber;
      let echartsInstance: ReactEChartsComponent | null = null;

      while (current) {
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

      function getRange(id: string): AxisRange {
        const zoomModels = model.findComponents({
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

function getChartRoot(page: Page, chartTitle: string) {
  return page.locator('article').filter({ has: chartTitleButton(page, chartTitle) });
}

interface AxisRange {
  start: number;
  end: number;
}

interface ZoomRanges {
  xAxis: AxisRange;
  yAxis: AxisRange;
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
