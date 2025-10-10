import { app } from 'electron';
import Store, { type Schema } from 'electron-store';
import { readFileUtf8 } from '@main/files/fileService';
import type { OpenedFile } from '../../../../types/ipc-contracts';

const MAX_RECENT_FILES = 10;

type AppState = {
  lastOpenedFilePath?: string;
  recentFiles: string[];
};

const schema: Schema<AppState> = {
  lastOpenedFilePath: { type: 'string' },
  recentFiles: { type: 'array', items: { type: 'string' }, default: [] },
};

// Electron Store v11 type resolution can hide inherited Conf methods in some setups.
// Cast a minimal surface (get/set/onDidChange) that we rely on.
const stateStore = new Store<AppState>({
  name: 'state',
  schema,
  // Allow overriding the storage location for tests
  ...(process.env.UNIPLOT_STATE_CWD ? { cwd: process.env.UNIPLOT_STATE_CWD } : {}),
}) as unknown as {
  get<K extends keyof AppState>(key: K): AppState[K] | undefined;
  set<K extends keyof AppState>(key: K, value: AppState[K]): void;
  onDidChange: (
    key: keyof AppState | string,
    cb: (newValue: AppState[keyof AppState] | undefined, oldValue: AppState[keyof AppState] | undefined) => void,
  ) => () => void;
};

export async function setLastOpenedFilePath(filePath: string): Promise<void> {
  // Update last opened
  stateStore.set('lastOpenedFilePath', filePath);
  // Update recents list (most recent first, unique, max length)
  const current = (stateStore.get('recentFiles') ?? []) as string[];
  const next = [filePath, ...current.filter((p) => p !== filePath)].slice(0, MAX_RECENT_FILES);
  stateStore.set('recentFiles', next);
  try {
    app.addRecentDocument(filePath);
  } catch {
    // noop if platform unsupported
  }
}

export async function getLastOpenedFilePath(): Promise<string | null> {
  return stateStore.get('lastOpenedFilePath') ?? null;
}

export async function getLastOpenedFile(): Promise<OpenedFile | null> {
  const p = await getLastOpenedFilePath();
  if (!p) return null;
  try {
    const content = await readFileUtf8(p);
    return { path: p, content };
  } catch {
    return null;
  }
}

export function onLastOpenedFilePathChange(cb: (newPath: string | undefined) => void): () => void {
  return stateStore.onDidChange('lastOpenedFilePath', (newValue) => {
    cb((newValue as string | undefined) ?? undefined);
  });
}

export async function getRecentFiles(): Promise<string[]> {
  return (stateStore.get('recentFiles') ?? []) as string[];
}

export async function removeFromRecentFiles(path: string): Promise<void> {
  const current = (stateStore.get('recentFiles') ?? []) as string[];
  const next = current.filter((p) => p !== path);
  if (next.length !== current.length) {
    stateStore.set('recentFiles', next);
  }
}

export function onRecentFilesChange(cb: (paths: string[]) => void): () => void {
  return stateStore.onDidChange('recentFiles', (newValue) => {
    cb(((newValue as unknown) as string[]) ?? []);
  });
}
