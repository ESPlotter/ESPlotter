import { UserPreferences } from '../entities/UserPreferences';

export interface UserPreferencesRepository {
  get(): Promise<UserPreferences>;
  save(preferences: UserPreferences): Promise<void>;
  onChangeChartSeriesPalette(listener: (preferences: UserPreferences) => void): () => void;
}
