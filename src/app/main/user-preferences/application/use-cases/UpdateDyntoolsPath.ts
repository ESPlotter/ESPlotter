import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

export class UpdateDyntoolsPath {
  constructor(private readonly repository: UserPreferencesRepository) {}

  public async run(path: string): Promise<UserPreferencesPrimitive> {
    const preferences = await this.repository.get();
    preferences.updateDyntoolsPath(path);
    await this.repository.save(preferences);
    return preferences.toPrimitives();
  }
}
