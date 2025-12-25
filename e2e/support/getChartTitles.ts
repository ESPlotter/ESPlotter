import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  // Find all buttons with class "text-2xl font-bold" which are chart title buttons
  // This matches the className in ChartTitle.tsx
  return page
    .locator('button.text-2xl.font-bold')
    .evaluateAll((buttons) =>
      buttons.map((button) => (button.textContent ?? '').trim()).filter((text) => text.length > 0),
    );
}
