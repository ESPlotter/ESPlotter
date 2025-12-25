import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  const chartContainers = page.locator('.echarts-for-react').locator('..');
  const count = await chartContainers.count();

  const titles: string[] = [];
  for (let i = 0; i < count; i++) {
    const container = chartContainers.nth(i);
    const titleButton = container.locator('button').first();
    const text = await titleButton.textContent();
    if (text) {
      titles.push(text.trim());
    }
  }

  return titles;
}
