import path from 'node:path';

import { ElectronApplication } from '@playwright/test';

export async function setNextOpenFixturePath(
  app: ElectronApplication,
  fileName: string,
): Promise<string> {
  const fullPath = path.resolve(process.cwd(), 'fixtures', fileName);
  await app.evaluate((_, fpath) => {
    process.env.ESPlotter_E2E_OPEN_PATH = fpath as string;
  }, fullPath);

  return fullPath;
}
