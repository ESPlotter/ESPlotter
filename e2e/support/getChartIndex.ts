import { Page } from '@playwright/test';

import { getChartTitles } from './getChartTitles';

export async function getChartIndex(page: Page, chartTitle: string): Promise<number> {
  const chartTitles = await getChartTitles(page);
  const index = chartTitles.indexOf(chartTitle);
  if (index === -1) {
    throw new Error(`Chart with title "${chartTitle}" was not found.`);
  }
  return index;
}
