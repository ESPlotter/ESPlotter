import { app } from 'electron';
import fs from 'node:fs/promises';
import Store from 'electron-store';

type AppState = { lastOpenedFilePath?: string };

// Electron Store v11 type resolution can hide inherited Conf methods in some setups.
// Cast to a minimal typed surface we rely on.
const stateStore = new Store<AppState>({ name: 'state' }) as unknown as {
  get<K extends keyof AppState>(key: K): AppState[K] | undefined;
  set<K extends keyof AppState>(key: K, value: AppState[K]): void;
  onDidChange: (
    key: keyof AppState | string,
    cb: (newValue: AppState[keyof AppState] | undefined, oldValue: AppState[keyof AppState] | undefined) => void,
  ) => () => void;
};

export async function saveFilePath(filePath: string): Promise<void> {
  stateStore.set('lastOpenedFilePath', filePath);
  try {
    app.addRecentDocument(filePath);
  } catch {
    // noop if platform unsupported
  }
}

export async function getLastOpenedFilePath(): Promise<string | null> {
  return stateStore.get('lastOpenedFilePath') ?? null;
}

export async function getLastOpenedFile(): Promise<{ path: string; content: string } | null> {
  const p = await getLastOpenedFilePath();
  if (!p) return null;
  try {
    const content = await fs.readFile(p, 'utf-8');
    return { path: p, content };
  } catch {
    return null;
  }
}

export function onLastOpenedFilePathChange(
  cb: (newPath: string | undefined) => void,
): () => void {
  return stateStore.onDidChange('lastOpenedFilePath', (newValue) => {
    cb((newValue as string | undefined) ?? undefined);
  });
}
