import { type Page } from '@playwright/test';

import { createChart } from './createChart';
import { selectChartByTitle } from './selectChartByTitle';

export async function createAndSelectChart(page: Page): Promise<string> {
  const chartTitle = await createChart(page);
  await selectChartByTitle(page, chartTitle);
  return chartTitle;
}
