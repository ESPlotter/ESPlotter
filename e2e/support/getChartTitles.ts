import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  // Get all buttons and filter for those that look like chart titles
  // Chart titles are simple text buttons without icons, excluding "New Chart"
  const buttons = await page.getByRole('button').all();
  const titles: string[] = [];

  for (const button of buttons) {
    const text = (await button.textContent())?.trim() || '';
    // Chart title buttons contain only text (no nested elements that would add extra whitespace or icons)
    // We exclude the "New Chart" button specifically
    // Chart titles will be "Chart 1", "Chart 2", or custom names
    if (text && text !== 'New Chart' && !text.includes('\n')) {
      // Additional check: chart title buttons should NOT have an svg child
      const svgCount = await button.locator('svg').count();
      if (svgCount === 0) {
        titles.push(text);
      }
    }
  }

  return titles;
}
