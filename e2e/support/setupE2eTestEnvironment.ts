import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { type ElectronApplication, type Page } from '@playwright/test';

import { getElectronAppForE2eTest } from './getElectronAppForE2eTest';
import { waitForPreloadScript } from './waitForPreloadScript';
import { waitForReactContent } from './waitForReactContent';

export async function setupE2eTestEnvironment(): Promise<{
  electronApp: ElectronApplication;
  mainPage: Page;
}> {
  const tmpStateDir = path.join(
    os.tmpdir(),
    `ESPlotter-e2e-state-${Date.now()}-${crypto.randomUUID()}`,
  );
  await fs.mkdir(tmpStateDir, { recursive: true });
  process.env.ESPLOTTER_STATE_CWD = tmpStateDir;

  const electronApp = await getElectronAppForE2eTest();
  const mainPage = await electronApp.firstWindow();

  await mainPage.waitForLoadState('domcontentloaded');
  await waitForPreloadScript(mainPage);
  await waitForReactContent(mainPage);

  return { electronApp, mainPage };
}
