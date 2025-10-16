import { Page } from '@playwright/test';

export function waitForFileParsed(page: Page): Promise<void> {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const off = window.files.onLastOpenedFileParsedChanged(() => {
          off();
          resolve();
        });
      }),
  );
}
