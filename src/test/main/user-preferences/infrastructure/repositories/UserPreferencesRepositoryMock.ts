import { UserPreferences } from '@main/user-preferences/domain/entities/UserPreferences';
import { UserPreferencesRepository } from '@main/user-preferences/domain/repositories/UserPreferencesRepository';

export class UserPreferencesRepositoryMock implements UserPreferencesRepository {
  private preferences: UserPreferences = UserPreferences.withDefaultChartSeriesPalette();
  private shouldFailOnGet = false;
  private chartPaletteListeners: Array<(preferences: UserPreferences) => void> = [];
  private dyntoolsPathListeners: Array<(preferences: UserPreferences) => void> = [];
  private pythonPathListeners: Array<(preferences: UserPreferences) => void> = [];
  private getCallCount = 0;
  private saveCallCount = 0;

  async get(): Promise<UserPreferences> {
    this.getCallCount += 1;
    if (this.shouldFailOnGet) {
      throw new Error('repository get failed');
    }
    return this.preferences;
  }

  async save(preferences: UserPreferences): Promise<void> {
    this.saveCallCount += 1;
    const previousPreferences = this.preferences;
    const previousPrimitives = previousPreferences.toPrimitives();
    const nextPrimitives = preferences.toPrimitives();

    const chartSeriesPaletteChanged =
      previousPrimitives.chartSeriesPalette.length !== nextPrimitives.chartSeriesPalette.length ||
      previousPrimitives.chartSeriesPalette.some(
        (color, index) => color !== nextPrimitives.chartSeriesPalette[index],
      );
    const dyntoolsPathChanged =
      previousPrimitives.general.paths.dyntoolsPath !== nextPrimitives.general.paths.dyntoolsPath;
    const pythonPathChanged =
      previousPrimitives.general.paths.pythonPath !== nextPrimitives.general.paths.pythonPath;

    if (chartSeriesPaletteChanged) {
      for (const listener of this.chartPaletteListeners) {
        listener(preferences);
      }
    }

    if (dyntoolsPathChanged) {
      for (const listener of this.dyntoolsPathListeners) {
        listener(preferences);
      }
    }

    if (pythonPathChanged) {
      for (const listener of this.pythonPathListeners) {
        listener(preferences);
      }
    }

    this.preferences = preferences;
  }

  onChangeChartSeriesPalette(listener: (preferences: UserPreferences) => void): () => void {
    this.chartPaletteListeners.push(listener);
    return () => {
      this.chartPaletteListeners = this.chartPaletteListeners.filter((item) => item !== listener);
    };
  }

  onChangeDyntoolsPath(listener: (preferences: UserPreferences) => void): () => void {
    this.dyntoolsPathListeners.push(listener);
    return () => {
      this.dyntoolsPathListeners = this.dyntoolsPathListeners.filter((item) => item !== listener);
    };
  }

  onChangePythonPath(listener: (preferences: UserPreferences) => void): () => void {
    this.pythonPathListeners.push(listener);
    return () => {
      this.pythonPathListeners = this.pythonPathListeners.filter((item) => item !== listener);
    };
  }

  setPreferences(preferences: UserPreferences): void {
    this.preferences = preferences;
  }

  failOnGet(): void {
    this.shouldFailOnGet = true;
  }

  expectGetCalledTimes(times: number): void {
    if (this.getCallCount !== times) {
      throw new Error(`Expected get to be called ${times} times but was ${this.getCallCount}`);
    }
  }

  expectSaveCalledTimes(times: number): void {
    if (this.saveCallCount !== times) {
      throw new Error(`Expected save to be called ${times} times but was ${this.saveCallCount}`);
    }
  }
}
