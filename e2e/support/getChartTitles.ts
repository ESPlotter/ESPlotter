import { Page } from '@playwright/test';

export async function getChartTitles(page: Page): Promise<string[]> {
  return page.locator('div.p-4.w-full').evaluateAll((elements) =>
    elements
      .map((element) => element.querySelector('button'))
      .filter((button): button is HTMLButtonElement => Boolean(button))
      .map((button) => button.textContent?.trim() ?? ''),
  );
}
