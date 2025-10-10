import { BrowserWindow } from 'electron';
import fs from 'node:fs/promises';
import { parseAllowedFileStructure } from '@shared/AllowedFileStructure';
import type { AllowedFileStructure } from '@shared/AllowedFileStructure';

export async function readFileUtf8(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function readAllowedFile(filePath: string): Promise<AllowedFileStructure> {
  const content = await readFileUtf8(filePath);
  return parseAllowedFileStructure(content);
}

export async function showOpenFileDialog(win: BrowserWindow): Promise<string | null> {
  const { dialog } = await import('electron');
  const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ['openFile'] });
  if (canceled) return null;
  return filePaths[0] ?? null;
}
