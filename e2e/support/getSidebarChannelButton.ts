import { type Locator, type Page } from '@playwright/test';

export function getSidebarChannelButton(
  page: Page,
  channelLabel: string,
  fileLabel?: string,
): Locator {
  if (fileLabel) {
    // Find the file heading, go to parent accordion item, then find channel button within that item
    return page
      .getByRole('heading', { level: 3, name: fileLabel })
      .locator('..')
      .locator('[data-sidebar="menu-button"]')
      .filter({ hasText: channelLabel })
      .first();
  }
  return page.locator('[data-sidebar="menu-button"]').filter({ hasText: channelLabel }).first();
}
