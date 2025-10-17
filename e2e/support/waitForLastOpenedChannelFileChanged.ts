import { Page } from '@playwright/test';

export function waitForLastOpenedChannelFileChanged(page: Page): Promise<void> {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const off = window.files.onLastOpenedChannelFileChanged(() => {
          off();
          resolve();
        });
      }),
  );
}
