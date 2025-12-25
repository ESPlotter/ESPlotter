import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  // Chart titles are buttons with specific characteristics:
  // 1. They are large text buttons (text-2xl class)
  // 2. They don't contain SVG icons
  // 3. They are not the "New Chart" button
  // 4. They are not sidebar buttons (which have parentheses for units)

  // Use evaluateAll to run the logic in the browser context for better performance
  return page.locator('button').evaluateAll((buttons) => {
    const titles: string[] = [];

    for (const button of buttons) {
      const text = button.textContent?.trim() || '';

      // Skip empty buttons
      if (!text) continue;

      // Skip "New Chart" button
      if (text === 'New Chart') continue;

      // Skip buttons with SVG children (icon buttons)
      if (button.querySelector('svg')) continue;

      // Skip sidebar channel buttons (they have parentheses for units like "Voltage (V)")
      if (text.includes('(') && text.includes(')')) continue;

      // Check if button has text-2xl class (chart titles are styled with this)
      const className = button.getAttribute('class') || '';
      if (className.includes('text-2xl') && className.includes('font-bold')) {
        titles.push(text);
      }
    }

    return titles;
  });
}
