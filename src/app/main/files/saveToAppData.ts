import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

export function getAppDataDir(): string {
  return path.join(app.getPath('appData'), 'uniplot');
}

export function getAppDataFilePath(name: string): string {
  return path.join(getAppDataDir(), name);
}

function sanitizeFileName(name: string): string {
  const normalized = name.normalize('NFKC');
  if (normalized.includes('..') || normalized.includes('/') || normalized.includes('\\')) {
    throw new Error('Invalid file name.');
  }
  const safe = normalized.replace(/[^A-Za-z0-9._-]/g, '_');
  if (!safe || safe === '.' || safe === '..') {
    throw new Error('Invalid file name.');
  }
  return safe;
}

export async function saveToAppData(fileData: { name: string; content: string }): Promise<void> {
  const dir = getAppDataDir();
  await fs.mkdir(dir, { recursive: true });
  const safeName = sanitizeFileName(fileData.name);
  const filePath = path.join(dir, safeName);
  await fs.writeFile(filePath, fileData.content, 'utf-8');
}
