import { expect, Page } from '@playwright/test';

import { getChartTitles } from './getChartTitles';

export async function createChart(page: Page): Promise<string> {
  const before = await getChartTitles(page);

  await page.getByRole('button', { name: 'New Chart' }).click();

  await expect
    .poll(async () => {
      const titles = await getChartTitles(page);
      return titles.length;
    })
    .toBe(before.length + 1);

  const after = await getChartTitles(page);

  const newChartTitle = after.find((title) => !before.includes(title));
  return newChartTitle ?? after[after.length - 1];
}
