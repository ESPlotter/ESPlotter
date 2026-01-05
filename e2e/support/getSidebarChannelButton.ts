import { type Locator, type Page } from '@playwright/test';

export function getSidebarChannelButton(page: Page, channelLabel: string): Locator {
  return page.locator('[data-sidebar="menu-button"]').filter({ hasText: channelLabel }).first();
}
