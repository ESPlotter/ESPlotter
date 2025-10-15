import { app } from 'electron';
import Store, { type Schema } from 'electron-store';
import { readFileUtf8 } from '@main/files/fileService';
import { isAllowedFileStructure, type AllowedFileStructure } from '@shared/AllowedFileStructure';
import type { OpenedFile } from '@shared/ipc/contracts';

type AppState = {
  lastOpenedFilePath?: string[];
};

const schema: Schema<AppState> = {
  lastOpenedFilePath: { 
    type: 'array', 
    items: { type: 'string' } 
  },
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
  delete: (key: keyof AppState | string) => void;
  onDidChange: (
    key: keyof AppState | string,
    cb: (
      newValue: AppState[keyof AppState] | undefined,
      oldValue: AppState[keyof AppState] | undefined,
    ) => void,
  ) => () => void;
};

export async function setLastOpenedFilePath(filePath: string): Promise<void> {
  const current = stateStore.get('lastOpenedFilePath') || [];

   const updated = [filePath, ...current.filter(f => f !== filePath)];

   const limited = updated.slice(0, 10);

   //save new list

   stateStore.set('lastOpenedFilePath',limited);

  try {
    app.addRecentDocument(filePath);
  } catch {
    // noop if platform unsupported
  }
}

export async function clearLastOpenedFilePath(): Promise<void> {
  try {
    stateStore.delete('lastOpenedFilePath');
  } catch {}
}

export async function getLastOpenedFilesPath(): Promise<string[] | null> {
  return stateStore.get('lastOpenedFilePath') ?? null;
}

export async function getLastOpenedFile(): Promise<OpenedFile | null> {
  const paths = await getLastOpenedFilesPath();
  const path = paths?.[0]
  if (!path) return null;

  try {
    const content = await readFileUtf8(path);
    const data: unknown = JSON.parse(content);
    if (!isAllowedFileStructure(data)) {
      await clearLastOpenedFilePath();
      return null;
    }
    return { path, data: data as AllowedFileStructure };
  } catch {
    // If corrupted JSON or unreadable, clear stored path per decision
    await clearLastOpenedFilePath();
    return null;
  }
}

export async function getLastOpenedFiles(): Promise<OpenedFile[] | null> {
  const paths = await getLastOpenedFilesPath();

  if (!paths) return null;

    const openedFiles: OpenedFile[] = [];

  for (const path of paths) {
    try {
      const content = await readFileUtf8(path);
      const data: unknown = JSON.parse(content);

      if (!isAllowedFileStructure(data)) {
        const filteredPaths = paths.filter(p => p !== path);
        await stateStore.set('lastOpenedFilePath', filteredPaths);
        continue;
      }

      openedFiles.push({ path, data: data as AllowedFileStructure });
    } catch {
      // Si JSON corrupto o archivo no accesible, eliminar del store
      const filteredPaths = paths.filter(p => p !== path);
      await stateStore.set('lastOpenedFilePath', filteredPaths);
      continue;
    }
  }
  return openedFiles.length > 0 ? openedFiles : null;
}

function onStateChange<K extends keyof AppState>(
  key: K,
  cb: (newValue: AppState[K] | undefined) => void,
): () => void {
  return stateStore.onDidChange(key as string, (newValue) => {
    cb((newValue as AppState[K] | undefined) ?? undefined);
  });
}

export function onLastOpenedFilePathChange(
  cb: (newPaths: string[] | undefined) => void
): () => void {
  return onStateChange('lastOpenedFilePath', cb);
}
