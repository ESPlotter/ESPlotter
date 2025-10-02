import { Page } from '@playwright/test';

export async function waitForReactContent(page: Page) {
  await page.waitForSelector('#root', { timeout: 20_000 });
  
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    const heading = document.querySelector('h1');
    return Boolean(root && root.childElementCount > 0 && heading);
  }, { timeout: 20_000 });
}
