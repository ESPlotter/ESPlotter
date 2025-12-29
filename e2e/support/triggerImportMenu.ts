import { ElectronApplication, Page } from '@playwright/test';

import { clickMenuItem } from './clickMenuItem';

export async function triggerImportMenu(
  app: ElectronApplication,
  mainPage: Page,
): Promise<void> {
  await mainPage.bringToFront();
  await clickMenuItem(app, ['File', 'Import']);
}
