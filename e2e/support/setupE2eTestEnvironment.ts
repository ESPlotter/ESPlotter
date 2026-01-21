import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ElectronApplication, _electron as electron, type Page } from '@playwright/test';

interface ElectronLaunchEnv {
  [key: string]: string;
}

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

  try {
    await waitForPreloadScript(mainPage);
  } catch (error) {
    await electronApp.close();
    throw error;
  }

  await waitForReactContent(mainPage);

  return { electronApp, mainPage };
}

async function getElectronAppForE2eTest(): Promise<ElectronApplication> {
  const isPackaged = Boolean(process.env.ESPLOTTER_E2E_PACKAGED);

  if (isPackaged) {
    return electron.launch({
      executablePath: getPackagedAppPath(),
      timeout: 20_000,
      env: getElectronLaunchEnv(true),
      args: ['--remote-debugging-port=0', '--disable-gpu'],
    });
  }

  return electron.launch({
    args: ['.'],
    timeout: 10_000,
    env: getElectronLaunchEnv(false),
  });
}

function getPackagedAppPath(): string {
  const appPath = process.env.ESPLOTTER_E2E_APP_PATH;
  if (!appPath) {
    throw new Error('ESPLOTTER_E2E_APP_PATH is required when ESPLOTTER_E2E_PACKAGED is set.');
  }

  return appPath;
}

function getElectronLaunchEnv(isPackaged: boolean): ElectronLaunchEnv {
  const baseEnv = {
    ...process.env,
    ELECTRON_DISABLE_SANDBOX: '1',
    ELECTRON_ENABLE_LOGGING: '1',
    CI: '1',
  } satisfies NodeJS.ProcessEnv;

  if (isPackaged) {
    return normalizeEnv({
      ...baseEnv,
      NODE_ENV: 'production',
    });
  }

  return normalizeEnv({
    ...baseEnv,
    NODE_ENV: 'development',
    ELECTRON_IS_DEV: '1',
    MAIN_WINDOW_VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173',
    MAIN_WINDOW_VITE_NAME: 'main_window',
  });
}

function normalizeEnv(env: NodeJS.ProcessEnv): ElectronLaunchEnv {
  const entries = Object.entries(env)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => [key, value]);

  return Object.fromEntries(entries);
}

async function waitForPreloadScript(page: Page): Promise<void> {
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

async function waitForReactContent(page: Page) {
  await page.waitForSelector('#root', { timeout: 20_000 });

  await page.waitForFunction(
    () => {
      const root = document.getElementById('root');
      return Boolean(root && root.childElementCount > 0);
    },
    { timeout: 20_000 },
  );
}
