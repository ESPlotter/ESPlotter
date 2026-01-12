import { type Schema } from 'electron-store';

import { DyntoolsPath } from '@main/user-preferences/domain/value-objects/DyntoolsPath';
import { PythonPath } from '@main/user-preferences/domain/value-objects/PythonPath';
import { BaseElectronStore } from '@shared/infrastructure/repositories/BaseElectronStore';

import { UserPreferences } from '../../domain/entities/UserPreferences';
import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

type UserPreferencesStore = {
  chartSeriesPalette?: string[];
  general?: {
    paths?: {
      dyntoolsPath?: string;
      pythonPath?: string;
    };
  };
};

const schema: Schema<UserPreferencesStore> = {
  chartSeriesPalette: {
    type: 'array',
    items: { type: 'string' },
  },
  general: {
    type: 'object',
    properties: {
      paths: {
        type: 'object',
        properties: {
          dyntoolsPath: {
            type: 'string',
          },
          pythonPath: {
            type: 'string',
          },
        },
      },
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
    const storedDyntoolsPath = this.store.get('general.paths.dyntoolsPath');
    const storedPythonPath = this.store.get('general.paths.pythonPath');

    const preferences = this.mapToUserPreferences({
      chartSeriesPalette: storedPalette,
      general: {
        paths: {
          dyntoolsPath: storedDyntoolsPath,
          pythonPath: storedPythonPath,
        },
      },
    });

    if (
      !Array.isArray(storedPalette) ||
      typeof storedDyntoolsPath !== 'string' ||
      typeof storedPythonPath !== 'string'
    ) {
      await this.save(preferences);
    }

    return preferences;
  }

  public async save(preferences: UserPreferences): Promise<void> {
    const primitives = preferences.toPrimitives();
    this.store.set('chartSeriesPalette', primitives.chartSeriesPalette);
    this.store.set('general', primitives.general);
  }

  public onChangeChartSeriesPalette(listener: (preferences: UserPreferences) => void): () => void {
    return this.store.onDidChange('chartSeriesPalette', () => {
      const primitives = this.store.store;
      listener(this.mapToUserPreferences(primitives));
    });
  }

  public onChangeDyntoolsPath(listener: (preferences: UserPreferences) => void): () => void {
    return this.store.onDidChange('general.paths.dyntoolsPath', () => {
      const primitives = this.store.store;
      listener(this.mapToUserPreferences(primitives));
    });
  }

  public onChangePythonPath(listener: (preferences: UserPreferences) => void): () => void {
    return this.store.onDidChange('general.paths.pythonPath', () => {
      const primitives = this.store.store;
      listener(this.mapToUserPreferences(primitives));
    });
  }

  private mapToUserPreferences(rawPreferences: Partial<UserPreferencesStore>): UserPreferences {
    const chartSeriesPalette = Array.isArray(rawPreferences.chartSeriesPalette)
      ? rawPreferences.chartSeriesPalette
      : UserPreferences.withDefaultChartSeriesPalette().toPrimitives().chartSeriesPalette;
    const dyntoolsPath =
      typeof rawPreferences.general?.paths?.dyntoolsPath === 'string'
        ? rawPreferences.general?.paths?.dyntoolsPath
        : DyntoolsPath.DEFAULT_VALUE;
    const pythonPath =
      typeof rawPreferences.general?.paths?.pythonPath === 'string'
        ? rawPreferences.general?.paths?.pythonPath
        : PythonPath.DEFAULT_VALUE;

    return UserPreferences.fromPrimitives({
      chartSeriesPalette,
      general: {
        paths: {
          dyntoolsPath,
          pythonPath,
        },
      },
    });
  }
}
