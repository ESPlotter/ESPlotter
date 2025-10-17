import { Page } from '@playwright/test';

export function waitForLastOpenedFileChanged(page: Page): Promise<void> {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const off = window.files.onLastOpenedFileChanged(() => {
          off();
          resolve();
        });
      }),
  );
}
