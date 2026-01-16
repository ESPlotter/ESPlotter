import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

process.env.ESPLOTTER_E2E_PACKAGED = '1';
process.env.ESPLOTTER_E2E_APP_PATH = path.resolve('out', 'esplotter-win32-x64', 'esplotter.exe');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  reporter: [['list'], ['html', { outputFolder: 'playwright-output/report', open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'playwright-output/test-results',
  timeout: 60 * 1000,
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
