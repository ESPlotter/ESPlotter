import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { chartContainer } from './support/chartContainer';
import { createChart } from './support/createChart';
import { expectSelectedChart } from './support/expectSelectedChart';
import { setNextOpenFixturePath } from './support/setNextOpenFixturePath';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerImportMenu } from './support/triggerImportMenu';
import { waitForLastOpenedChannelFileChanged } from './support/waitForLastOpenedChannelFileChanged';

import type { FiberNode, ReactEChartsComponent } from './support/chartHelpers';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart zoom, pan, and reset controls', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    await openAndExpandTest3File(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows zoom, pan, and reset buttons on chart', async () => {
    const chartTitle = await createChart(mainPage);
    const container = chartContainer(mainPage, chartTitle);

    // Check for zoom button (should be highlighted by default)
    const zoomButton = container.locator('button[title="Zoom mode"]');
    await expect(zoomButton).toBeVisible();
    
    // Check for pan button
    const panButton = container.locator('button[title="Pan mode"]');
    await expect(panButton).toBeVisible();
    
    // Check for reset button
    const resetButton = container.locator('button[title="Reset zoom"]');
    await expect(resetButton).toBeVisible();
  });

  test('zoom mode is enabled by default', async () => {
    const chartTitle = await createChart(mainPage);
    const container = chartContainer(mainPage, chartTitle);

    const zoomButton = container.locator('button[title="Zoom mode"]');
    
    // Zoom button should have default variant (highlighted)
    const classList = await zoomButton.getAttribute('class');
    expect(classList).toContain('bg-primary'); // Default variant has primary background
  });

  test('can toggle between zoom and pan modes', async () => {
    const chartTitle = await createChart(mainPage);
    const container = chartContainer(mainPage, chartTitle);

    const zoomButton = container.locator('button[title="Zoom mode"]');
    const panButton = container.locator('button[title="Pan mode"]');

    // Initially zoom is active
    let zoomClass = await zoomButton.getAttribute('class');
    expect(zoomClass).toContain('bg-primary');

    // Click pan button
    await panButton.click();
    await mainPage.waitForTimeout(100);

    // Pan should now be active, zoom inactive
    const panClass = await panButton.getAttribute('class');
    expect(panClass).toContain('bg-primary');
    
    zoomClass = await zoomButton.getAttribute('class');
    expect(zoomClass).not.toContain('bg-primary');

    // Click zoom button again
    await zoomButton.click();
    await mainPage.waitForTimeout(100);

    // Zoom should be active again
    zoomClass = await zoomButton.getAttribute('class');
    expect(zoomClass).toContain('bg-primary');
  });

  test('can perform zoom in by dragging right', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();

    // Get initial axis ranges
    const initialRanges = await getChartAxisRanges(mainPage, chartTitle);

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
    await mainPage.waitForTimeout(200);

    // Get new axis ranges
    const zoomedRanges = await getChartAxisRanges(mainPage, chartTitle);

    // Verify that the ranges have changed (zoom applied)
    expect(zoomedRanges.xAxis.min).toBeGreaterThan(initialRanges.xAxis.min);
    expect(zoomedRanges.xAxis.max).toBeLessThan(initialRanges.xAxis.max);
    expect(zoomedRanges.yAxis.min).not.toBe(initialRanges.yAxis.min);
    expect(zoomedRanges.yAxis.max).not.toBe(initialRanges.yAxis.max);
  });

  test('shows visual rectangle while dragging in zoom mode', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();

    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    const startX = box.x + box.width * 0.3;
    const startY = box.y + box.height * 0.3;
    const endX = box.x + box.width * 0.6;
    const endY = box.y + box.height * 0.6;

    // Start dragging
    await mainPage.mouse.move(startX, startY);
    await mainPage.mouse.down();
    await mainPage.mouse.move(endX, endY, { steps: 5 });

    // Check that visual rectangle is visible
    const rectangle = container.locator('div[style*="border: 1px dashed black"]');
    await expect(rectangle).toBeVisible();

    // Release mouse
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(100);

    // Rectangle should disappear after release
    await expect(rectangle).not.toBeVisible();
  });

  test('can reset zoom by dragging left', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();

    // Get initial axis ranges
    const initialRanges = await getChartAxisRanges(mainPage, chartTitle);

    // First, zoom in
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(200);

    // Verify zoom was applied
    const zoomedRanges = await getChartAxisRanges(mainPage, chartTitle);
    expect(zoomedRanges.xAxis.min).toBeGreaterThan(initialRanges.xAxis.min);

    // Now reset by dragging left
    await mainPage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, { steps: 10 });
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(200);

    // Get ranges after reset
    const resetRanges = await getChartAxisRanges(mainPage, chartTitle);

    // Verify that ranges are back to original or close to it
    expect(Math.abs(resetRanges.xAxis.min - initialRanges.xAxis.min)).toBeLessThan(0.1);
    expect(Math.abs(resetRanges.xAxis.max - initialRanges.xAxis.max)).toBeLessThan(0.1);
  });

  test('can reset zoom using reset button', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();
    const resetButton = container.locator('button[title="Reset zoom"]');

    // Get initial axis ranges
    const initialRanges = await getChartAxisRanges(mainPage, chartTitle);

    // Zoom in
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(200);

    // Verify zoom was applied
    const zoomedRanges = await getChartAxisRanges(mainPage, chartTitle);
    expect(zoomedRanges.xAxis.min).toBeGreaterThan(initialRanges.xAxis.min);

    // Click reset button
    await resetButton.click();
    await mainPage.waitForTimeout(200);

    // Get ranges after reset
    const resetRanges = await getChartAxisRanges(mainPage, chartTitle);

    // Verify that ranges are back to original
    expect(Math.abs(resetRanges.xAxis.min - initialRanges.xAxis.min)).toBeLessThan(0.1);
    expect(Math.abs(resetRanges.xAxis.max - initialRanges.xAxis.max)).toBeLessThan(0.1);
  });

  test('can pan chart in pan mode', async () => {
    const chartTitle = await createAndSelectChart(mainPage);
    await addVoltageChannelToChart(mainPage);
    
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();
    const panButton = container.locator('button[title="Pan mode"]');

    // First zoom in so we can pan
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(200);

    // Get ranges after zoom
    const zoomedRanges = await getChartAxisRanges(mainPage, chartTitle);

    // Switch to pan mode
    await panButton.click();
    await mainPage.waitForTimeout(100);

    // Perform pan by dragging
    await mainPage.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3, { steps: 10 });
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(200);

    // Get ranges after pan
    const pannedRanges = await getChartAxisRanges(mainPage, chartTitle);

    // Verify that the view has shifted (different min/max but same range)
    const zoomedRangeX = zoomedRanges.xAxis.max - zoomedRanges.xAxis.min;
    const pannedRangeX = pannedRanges.xAxis.max - pannedRanges.xAxis.min;
    
    // Range should remain the same
    expect(Math.abs(pannedRangeX - zoomedRangeX)).toBeLessThan(0.1);
    
    // But min/max should have changed
    expect(pannedRanges.xAxis.min).not.toBe(zoomedRanges.xAxis.min);
    expect(pannedRanges.xAxis.max).not.toBe(zoomedRanges.xAxis.max);
  });

  test('chart activation still works after zoom/pan implementation', async () => {
    const chartTitle = await createChart(mainPage);
    
    // Chart should not be selected initially
    await expectSelectedChart(mainPage, null);

    // Click to select
    await selectChartByTitle(mainPage, chartTitle);
    await expectSelectedChart(mainPage, chartTitle);

    // Click again to deselect
    await selectChartByTitle(mainPage, chartTitle, null);
    await expectSelectedChart(mainPage, null);
  });

  test('does not activate chart when dragging in zoom mode', async () => {
    const chartTitle = await createChart(mainPage);
    const container = chartContainer(mainPage, chartTitle);
    const chartElement = container.locator('.echarts-for-react').first();

    // Chart should not be selected initially
    await expectSelectedChart(mainPage, null);

    // Perform a drag (zoom action)
    const box = await chartElement.boundingBox();
    if (!box) throw new Error('Chart element not found');

    await mainPage.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await mainPage.mouse.down();
    await mainPage.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.7, { steps: 10 });
    await mainPage.mouse.up();
    await mainPage.waitForTimeout(200);

    // Chart should still not be selected (drag should not trigger activation)
    await expectSelectedChart(mainPage, null);
  });
});

// Helper functions

async function openAndExpandTest3File(electronApp: ElectronApplication, page: Page) {
  const fixtureAbsolutePath = await setNextOpenFixturePath(electronApp, 'test3.json');
  await triggerImportMenu(page);
  await waitForLastOpenedChannelFileChanged(page, fixtureAbsolutePath);
  
  // Expand the tree
  const expandButton = page.locator('button[aria-label="Expand all"]');
  await expandButton.click();
  await page.waitForTimeout(100);
}

async function createAndSelectChart(page: Page): Promise<string> {
  const chartTitle = await createChart(page);
  await selectChartByTitle(page, chartTitle);
  return chartTitle;
}

async function selectChartByTitle(
  page: Page,
  chartTitle: string,
  expectedSelectedTitle: string | null = chartTitle,
): Promise<void> {
  await chartContainer(page, chartTitle).click();
  await expectSelectedChart(page, expectedSelectedTitle);
}

async function clickSidebarChannel(page: Page, channelLabel: string) {
  await page.getByRole('checkbox', { name: channelLabel }).click();
  await page.waitForTimeout(100);
}

async function addVoltageChannelToChart(page: Page) {
  await clickSidebarChannel(page, 'Voltage (V)');
}

async function getChartAxisRanges(page: Page, chartTitle: string): Promise<{
  xAxis: { min: number; max: number };
  yAxis: { min: number; max: number };
}> {
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

      const option = instance.getOption();
      const xAxis = option.xAxis?.[0] || {};
      const yAxis = option.yAxis?.[0] || {};

      return {
        xAxis: {
          min: typeof xAxis.min === 'number' ? xAxis.min : 0,
          max: typeof xAxis.max === 'number' ? xAxis.max : 0,
        },
        yAxis: {
          min: typeof yAxis.min === 'number' ? yAxis.min : 0,
          max: typeof yAxis.max === 'number' ? yAxis.max : 0,
        },
      };
    },
    { chartIndex },
  );
}

async function getChartIndex(page: Page, chartTitle: string): Promise<number> {
  const chartTitles = await getChartTitles(page);
  const index = chartTitles.indexOf(chartTitle);
  if (index === -1) {
    throw new Error(`Chart with title "${chartTitle}" was not found.`);
  }
  return index;
}

async function getChartTitles(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('article button'));
    return buttons
      .map((btn) => btn.textContent?.trim())
      .filter((text): text is string => typeof text === 'string' && text.length > 0);
  });
}
