import { Page } from '@playwright/test';

import { chartTitleButton } from './chartTitleButton';

export function chartContainer(page: Page, chartTitle: string) {
  return page
    .locator('article')
    .filter({ has: chartTitleButton(page, chartTitle) })
    .locator('div.border-2')
    .first();
}
