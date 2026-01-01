import { expect, Page } from '@playwright/test';

import { getSelectedChartTitle } from './getSelectedChartTitle';

export async function expectSelectedChart(page: Page, expectedTitle: string | null): Promise<void> {
  await expect.poll(async () => await getSelectedChartTitle(page)).toBe(expectedTitle);
}
