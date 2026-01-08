import { type Page } from '@playwright/test';

import { chartContainer } from './chartContainer';
import { expectSelectedChart } from './expectSelectedChart';
import { getSelectedChartTitle } from './getSelectedChartTitle';

export async function selectChartByTitle(
  page: Page,
  chartTitle: string,
  expectedSelection: string | null = chartTitle,
): Promise<void> {
  const chartLocator = chartContainer(page, chartTitle);
  await chartLocator.waitFor({ state: 'visible' });

  const currentSelection = await getSelectedChartTitle(page);
  if (currentSelection !== expectedSelection) {
    await chartLocator.click();
  }

  await expectSelectedChart(page, expectedSelection);
}
