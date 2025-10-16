import { type ElectronApplication, type Page } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { waitForReactContent } from './waitForReactContent';
import { waitForPreloadScript } from './waitForPreloadScript';
import { getElectronAppForE2eTest } from './getElectronAppForE2eTest';

export async function setupE2eTestEnvironment(): Promise<{
  electronApp: ElectronApplication;
  mainPage: Page;
}> {
  const tmpStateDir = path.join(
    os.tmpdir(),
    `uniplot-e2e-state-${Date.now()}-${crypto.randomUUID()}`,
  );
  await fs.mkdir(tmpStateDir, { recursive: true });
  process.env.UNIPLOT_STATE_CWD = tmpStateDir;

  const electronApp = await getElectronAppForE2eTest();
  const mainPage = await electronApp.firstWindow();

  await mainPage.waitForLoadState('domcontentloaded');
  await waitForPreloadScript(mainPage);
  await waitForReactContent(mainPage);

  return { electronApp, mainPage };
}
