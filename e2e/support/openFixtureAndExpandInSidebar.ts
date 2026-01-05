import { type ElectronApplication, type Page } from '@playwright/test';

import { expandFileInSidebar } from './expandFileInSidebar';
import { openFixtureViaImportMenu } from './openFixtureViaImportMenu';

export async function openFixtureAndExpandInSidebar(
  app: ElectronApplication,
  page: Page,
  fixtureName: string,
  fileLabel: string,
): Promise<void> {
  await openFixtureViaImportMenu(app, page, fixtureName);
  await expandFileInSidebar(page, fileLabel);
}
