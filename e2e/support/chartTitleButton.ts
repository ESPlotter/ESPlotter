import { Page } from '@playwright/test';

export function chartTitleButton(page: Page, chartTitle: string) {
  return page.getByRole('button', { name: chartTitle });
}
