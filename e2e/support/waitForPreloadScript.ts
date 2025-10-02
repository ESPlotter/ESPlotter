import { Page } from '@playwright/test';

export async function waitForPreloadScript(page: Page): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 200; // 20 seconds max

    const interval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for preload script'));
        return;
      }

      const versions = await page.evaluate(() => {
        return window.versions;
      });

      if (versions) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

