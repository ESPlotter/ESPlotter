import path from 'node:path';

import type { FullConfig } from '@playwright/test';

export default async function setupPackagedE2e(_: FullConfig): Promise<void> {
  process.env.ESPLOTTER_E2E_PACKAGED = '1';
  process.env.ESPLOTTER_E2E_APP_PATH = path.join('out', 'esplotter-win32-x64', 'esplotter.exe');
}
