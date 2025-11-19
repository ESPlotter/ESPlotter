import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  return page
    .locator('button')
    .filter({ hasText: /^Chart:/ })
    .evaluateAll((buttons) =>
      buttons.map((button) => (button.textContent ?? '').trim()).filter((text) => text.length > 0),
    );
}
