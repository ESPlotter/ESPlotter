import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { UserPreferences } from '@main/user-preferences/domain/entities/UserPreferences';
import { ElectronStoreUserPreferencesRepository } from '@main/user-preferences/infrastructure/repositories/ElectronStoreUserPreferencesRepository';
import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { UserPreferencesPrimitiveMother } from '../../../../shared/domain/primitives/UserPreferencesPrimitiveMother';

let repository: ElectronStoreUserPreferencesRepository;

describe('ElectronStoreUserPreferencesRepository', () => {
  beforeEach(async () => {
    const cwd = await createIsolatedDirectory();
    process.env.ESPLOTTER_STATE_CWD = cwd;
    resetElectronStoreCache();
    repository = new ElectronStoreUserPreferencesRepository();
  });

  afterEach(() => {
    resetElectronStoreCache();
    delete process.env.ESPLOTTER_STATE_CWD;
  });

  it('returns default preferences when settings file is empty', async () => {
    const preferences = await repository.get();
    expect(preferences.toPrimitives()).toEqual(
      UserPreferences.withDefaultChartSeriesPalette().toPrimitives(),
    );
  });

  it('persists and retrieves chart series palette updates', async () => {
    const expected = UserPreferences.fromPrimitives(
      UserPreferencesPrimitiveMother.with({
        chartSeriesPalette: UserPreferencesPrimitiveMother.randomPalette(4),
      }),
    );

    await repository.save(expected);
    const persisted = await repository.get();

    expect(persisted.toPrimitives()).toEqual(expected.toPrimitives());
  });

  it('notifies listeners when values change', async () => {
    const observed: UserPreferences[] = [];
    const unsubscribe = repository.onChangeChartSeriesPalette((preferences) => {
      observed.push(preferences);
    });

    const next = UserPreferences.fromPrimitives(
      UserPreferencesPrimitiveMother.with({
        chartSeriesPalette: UserPreferencesPrimitiveMother.randomPalette(2),
      }),
    );

    await repository.save(next);

    expect(observed).toHaveLength(1);
    expect(observed[0]?.toPrimitives()).toEqual(next.toPrimitives());

    unsubscribe();
  });
});

async function createIsolatedDirectory(): Promise<string> {
  const prefix = path.join(os.tmpdir(), 'esplotter-user-preferences-');
  return fs.mkdtemp(prefix);
}

function resetElectronStoreCache(): void {
  const stores: Map<string, unknown> | undefined = Reflect.get(BaseElectronStore, 'stores');
  stores?.clear();
}
