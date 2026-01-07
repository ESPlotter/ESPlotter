import { type Schema } from 'electron-store';

import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { UserPreferences } from '../../domain/entities/UserPreferences';
import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

type UserPreferencesStore = {
  chartSeriesPalette?: string[];
};

const schema: Schema<UserPreferencesStore> = {
  chartSeriesPalette: {
    type: 'array',
    items: { type: 'string' },
  },
};

export class ElectronStoreUserPreferencesRepository
  extends BaseElectronStore<UserPreferencesStore>
  implements UserPreferencesRepository
{
  constructor() {
    super('settings', schema);
  }

  public async get(): Promise<UserPreferences> {
    const storedPalette = this.store.get('chartSeriesPalette');

    const preferences = this.mapToUserPreferences({ chartSeriesPalette: storedPalette });

    if (!Array.isArray(storedPalette)) {
      await this.save(preferences);
    }

    return preferences;
  }

  public async save(preferences: UserPreferences): Promise<void> {
    const primitives = preferences.toPrimitives();
    for (const [key, value] of Object.entries(primitives)) {
      this.store.set(key, value);
    }
  }

  public onChangeChartSeriesPalette(listener: (preferences: UserPreferences) => void): () => void {
    return this.store.onDidChange('chartSeriesPalette', () => {
      const primitives = this.store.store;
      listener(this.mapToUserPreferences(primitives));
    });
  }

  private mapToUserPreferences(rawPreferences: Partial<UserPreferencesStore>): UserPreferences {
    if (!Array.isArray(rawPreferences.chartSeriesPalette)) {
      return UserPreferences.withDefaultChartSeriesPalette();
    }

    return UserPreferences.fromPrimitives({
      chartSeriesPalette: rawPreferences.chartSeriesPalette,
    });
  }
}
