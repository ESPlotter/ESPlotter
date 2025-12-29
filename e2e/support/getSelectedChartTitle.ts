import { Page } from '@playwright/test';

import { chartContainer } from './chartContainer';
import { getChartTitles } from './getChartTitles';

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
