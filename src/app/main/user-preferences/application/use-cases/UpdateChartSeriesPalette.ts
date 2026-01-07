import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

export class UpdateChartSeriesPalette {
  constructor(private readonly repository: UserPreferencesRepository) {}

  public async run(colors: string[]): Promise<UserPreferencesPrimitive> {
    const preferences = await this.repository.get();
    preferences.updateChartSeriesPalette(colors);
    await this.repository.save(preferences);
    return preferences.toPrimitives();
  }
}
