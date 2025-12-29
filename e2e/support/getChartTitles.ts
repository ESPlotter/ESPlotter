import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  const titles = await page
    .getByRole('main')
    .getByRole('article')
    .getByRole('heading', { level: 2 })
    .allTextContents();
  return titles
    .map((title) => title.trim())
    .filter((title) => title.length > 0 && title !== 'New Chart');
}
