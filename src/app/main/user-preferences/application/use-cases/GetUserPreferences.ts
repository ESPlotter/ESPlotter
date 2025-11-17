import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

export class GetUserPreferences {
  constructor(private readonly repository: UserPreferencesRepository) {}

  public async run(): Promise<UserPreferencesPrimitive> {
    const preferences = await this.repository.get();
    return preferences.toPrimitives();
  }
}
