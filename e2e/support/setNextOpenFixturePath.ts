import { ElectronApplication } from '@playwright/test';
import path from 'node:path';

export async function setNextOpenFixturePath(
  app: ElectronApplication,
  fileName: string,
): Promise<string> {
  const fullPath = path.resolve(process.cwd(), 'fixtures', fileName);
  await app.evaluate((_, fpath) => {
    process.env.UNIPLOT_E2E_OPEN_PATH = fpath as string;
  }, fullPath);

  return fullPath;
}
