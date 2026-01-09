import { type Schema } from 'electron-store';

import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { UserPreferences } from '../../domain/entities/UserPreferences';
import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

type UserPreferencesStore = {
  chartSeriesPalette?: string[];
  dataTableFormat?: {
    decimals?: number;
    fixed?: boolean;
  };
};

const schema: Schema<UserPreferencesStore> = {
  chartSeriesPalette: {
    type: 'array',
    items: { type: 'string' },
  },
  dataTableFormat: {
    type: 'object',
    properties: {
      decimals: { type: 'number' },
      fixed: { type: 'boolean' },
    },
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
    const storedDataTableFormat = this.store.get('dataTableFormat');

    const preferences = this.mapToUserPreferences({
      chartSeriesPalette: storedPalette,
      dataTableFormat: storedDataTableFormat,
    });

    if (!Array.isArray(storedPalette) || !storedDataTableFormat) {
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

    const dataTableFormat: { decimals: number; fixed: boolean } =
      rawPreferences.dataTableFormat &&
      typeof rawPreferences.dataTableFormat.decimals === 'number' &&
      typeof rawPreferences.dataTableFormat.fixed === 'boolean'
        ? {
            decimals: rawPreferences.dataTableFormat.decimals,
            fixed: rawPreferences.dataTableFormat.fixed,
          }
        : { decimals: 6, fixed: true };

    return UserPreferences.fromPrimitives({
      chartSeriesPalette: rawPreferences.chartSeriesPalette,
      dataTableFormat: dataTableFormat,
    });
  }
}
