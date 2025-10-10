import { app } from 'electron';
import Store, { type Schema } from 'electron-store';
import { readFileUtf8 } from '@main/files/fileService';
import type { OpenedFile } from '@shared/ipc/contracts';

type AppState = {
  lastOpenedFilePath?: string;
};

const schema: Schema<AppState> = {
  lastOpenedFilePath: { type: 'string' },
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
    cb: (
      newValue: AppState[keyof AppState] | undefined,
      oldValue: AppState[keyof AppState] | undefined,
    ) => void,
  ) => () => void;
};

export async function setLastOpenedFilePath(filePath: string): Promise<void> {
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

function onStateChange<K extends keyof AppState>(
  key: K,
  cb: (newValue: AppState[K] | undefined) => void,
): () => void {
  return stateStore.onDidChange(key as string, (newValue) => {
    cb((newValue as AppState[K] | undefined) ?? undefined);
  });
}

export function onLastOpenedFilePathChange(cb: (newPath: string | undefined) => void): () => void {
  return onStateChange('lastOpenedFilePath', cb);
}
