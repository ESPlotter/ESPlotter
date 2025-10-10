import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

export function getAppDataDir(): string {
  return path.join(app.getPath('appData'), 'uniplot');
}

export function getAppDataFilePath(name: string): string {
  return path.join(getAppDataDir(), name);
}

export async function saveToAppData(fileData: { name: string; content: string }): Promise<void> {
  const dir = getAppDataDir();
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileData.name);
  await fs.writeFile(filePath, Buffer.from(fileData.content, 'base64'));
  // return filePath;
}
