import { type Locator, type Page } from '@playwright/test';

export function getSidebarChannelButton(
  page: Page,
  channelLabel: string,
  fileLabel?: string,
): Locator {
  if (fileLabel) {
    const fileTrigger = page.getByRole('button', { name: fileLabel });
    return fileTrigger
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: channelLabel })
      .first();
  }
  return page.getByRole('button', { name: channelLabel }).first();
}
