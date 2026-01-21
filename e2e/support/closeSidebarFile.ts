import { type Page } from '@playwright/test';

export async function closeSidebarFile(page: Page, fileLabel: string): Promise<void> {
  const fileTrigger = page.getByRole('button', { name: fileLabel });
  const closeButton = fileTrigger
    .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
    .getByRole('button', { name: /close file/i })
    .first();

  await closeButton.waitFor({ state: 'visible' });
  await closeButton.click();
}
