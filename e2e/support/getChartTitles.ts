import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  // Get all buttons that match "Chart X" pattern or have been renamed
  // Exclude buttons that are in the sidebar or have icons (like "New Chart")

  const allButtons = await page.locator('button').all();
  const titles: string[] = [];

  for (const button of allButtons) {
    const text = (await button.textContent())?.trim() || '';

    // Skip empty buttons
    if (!text) {
      continue;
    }

    // Skip "New Chart" button
    if (text === 'New Chart') {
      continue;
    }

    // Skip buttons with SVG children (icon buttons)
    const svgCount = await button.locator('svg').count();
    if (svgCount > 0) {
      continue;
    }

    // Skip sidebar buttons (they have specific classes or are nested in specific elements)
    // Channel buttons have format like "Voltage (V)" with parentheses
    if (text.includes('(') && text.includes(')')) {
      continue;
    }

    // Check if this button has the chart title styling (text-2xl class)
    const className = (await button.getAttribute('class')) || '';
    if (className.includes('text-2xl')) {
      titles.push(text);
    }
  }

  return titles;
}
