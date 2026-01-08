import { type Page } from '@playwright/test';

export async function expandFileInSidebar(page: Page, fileLabel: string): Promise<void> {
  const fileTrigger = page.getByRole('button', { name: fileLabel });
  await fileTrigger.waitFor({ state: 'visible' });
  await fileTrigger.click();
}
