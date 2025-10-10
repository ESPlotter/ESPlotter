import { describe, it, expect, beforeEach, vi } from 'vitest';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

// Mock Electron 'app' used in appState
vi.mock('electron', () => ({
  app: {
    addRecentDocument: vi.fn(),
  },
}));

describe('appState (electron-store + schema)', () => {
  let tmpDir: string;

  async function freshImport() {
    // Ensure module re-evaluates using our temp cwd
    vi.resetModules();
    process.env.UNIPLOT_STATE_CWD = tmpDir;
    return await import('../../../app/main/state/appState');
  }

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uniplot-state-'));
  });

  it('creates recents with limit and dedupe', async () => {
    const { setLastOpenedFilePath, getRecentFiles, getLastOpenedFilePath } = await freshImport();

    // Initially empty
    expect(await getRecentFiles()).toEqual([]);
    expect(await getLastOpenedFilePath()).toBeNull();

    const files = Array.from({ length: 12 }, (_, i) => `/tmp/file-${i + 1}.txt`);
    for (const f of files) {
      // eslint-disable-next-line no-await-in-loop
      await setLastOpenedFilePath(f);
    }

    const recents = await getRecentFiles();
    expect(recents.length).toBe(10);
    // Most recent first
    expect(recents[0]).toBe(files.at(-1));
    // Last of the list should be the 10th most recent (file-3)
    expect(recents.at(-1)).toBe('/tmp/file-3.txt');

    // Dedup + move to front
    await setLastOpenedFilePath('/tmp/file-5.txt');
    const recents2 = await getRecentFiles();
    expect(recents2[0]).toBe('/tmp/file-5.txt');
    // No duplicates
    expect(recents2.filter((p) => p === '/tmp/file-5.txt').length).toBe(1);
  });

  it('removeFromRecentFiles removes and notifies', async () => {
    const { setLastOpenedFilePath, getRecentFiles, removeFromRecentFiles, onRecentFilesChange } =
      await freshImport();

    await setLastOpenedFilePath('/tmp/a.txt');
    await setLastOpenedFilePath('/tmp/b.txt');

    let observed: string[] | null = null;
    const off = onRecentFilesChange((paths) => {
      observed = paths;
    });

    await removeFromRecentFiles('/tmp/a.txt');
    expect(await getRecentFiles()).toEqual(['/tmp/b.txt']);

    // Observer should have run
    expect(observed).toEqual(['/tmp/b.txt']);
    off();
  });
});

