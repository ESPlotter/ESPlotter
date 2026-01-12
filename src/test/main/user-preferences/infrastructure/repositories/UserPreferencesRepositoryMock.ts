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
    this.preferences = preferences;
    for (const listener of this.chartPaletteListeners) {
      listener(preferences);
    }
    for (const listener of this.dyntoolsPathListeners) {
      listener(preferences);
    }
    for (const listener of this.pythonPathListeners) {
      listener(preferences);
    }
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
