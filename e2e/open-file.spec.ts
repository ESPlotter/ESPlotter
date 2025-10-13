import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

import { waitForReactContent } from './support/waitForReactContent';
import { waitForPreloadScript } from './support/waitForPreloadScript';
import { getElectronAppForE2eTest } from './support/getElectronAppForE2eTest';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Open file flow', () => {
  test.beforeEach(async () => {
    // Isolate app state (electron-store) per test run
    const tmpStateDir = path.join(os.tmpdir(), `uniplot-e2e-state-${Date.now()}-${Math.random()}`);
    await fs.mkdir(tmpStateDir, { recursive: true });
    process.env.UNIPLOT_STATE_CWD = tmpStateDir;

    electronApp = await getElectronAppForE2eTest();
    mainPage = await electronApp.firstWindow();

    await mainPage.waitForLoadState('domcontentloaded');
    await waitForPreloadScript(mainPage);
    await waitForReactContent(mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('opens a valid file (test3.json) and renders the chart', async () => {
    const validPath = path.resolve(process.cwd(), 'fixtures', 'test3.json');

    // Wait until renderer receives the parsed file event
    await mainPage.evaluate(
      (fpath) =>
        new Promise<void>((resolve, reject) => {
          try {
            const off = window.files.onLastOpenedFileParsedChanged(() => {
              off();
              resolve();
            });
            window.files.openByPath(fpath);
          } catch (e) {
            reject(e);
          }
        }),
      validPath,
    );

    // Chart should render a canvas via ECharts CanvasRenderer
    await expect(mainPage.locator('canvas').first()).toBeVisible();

    // Last opened file path should be stored
    const lastPath = await mainPage.evaluate(() => window.files.getLastOpenedFilesPath());
    expect(lastPath).toBe(validPath);
  });

  test('emits fileOpenFailed for invalid format (test1.json)', async () => {
    const invalidPath = path.resolve(process.cwd(), 'fixtures', 'test1.json');

    const payload = await mainPage.evaluate(
      (fpath) =>
        new Promise<{ path: string; reason: string; message?: string }>((resolve) => {
          const off = window.files.onFileOpenFailed((p) => {
            off();
            resolve(p);
          });
          window.files.openByPath(fpath);
        }),
      invalidPath,
    );

    expect(payload.path).toBe(invalidPath);
    expect(payload.reason).toBe('invalid_format');

    // App state should be cleared after invalid file
    const lastPath = await mainPage.evaluate(() => window.files.getLastOpenedFilesPath());
    expect(lastPath).toBeNull();

    // No chart should be rendered
    await expect(mainPage.locator('canvas')).toHaveCount(0);
  });

  test('emits fileOpenFailed for not found path', async () => {
    const missingPath = path.resolve(process.cwd(), 'fixtures', 'does-not-exist.json');

    const payload = await mainPage.evaluate(
      (fpath) =>
        new Promise<{ path: string; reason: string; message?: string }>((resolve) => {
          const off = window.files.onFileOpenFailed((p) => {
            off();
            resolve(p);
          });
          window.files.openByPath(fpath);
        }),
      missingPath,
    );

    expect(payload.path).toBe(missingPath);
    expect(payload.reason).toBe('not_found');

    const lastPath = await mainPage.evaluate(() => window.files.getLastOpenedFilesPath());
    expect(lastPath).toBeNull();

    await expect(mainPage.locator('canvas')).toHaveCount(0);
  });
});
