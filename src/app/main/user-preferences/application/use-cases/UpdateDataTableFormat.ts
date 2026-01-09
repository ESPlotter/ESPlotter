import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

export class UpdateDataTableFormat {
  constructor(private repository: UserPreferencesRepository) {}

  public async execute(decimals: number, fixed: boolean): Promise<UserPreferencesPrimitive> {
    const preferences = await this.repository.get();
    preferences.updateDataTableFormat(decimals, fixed);
    await this.repository.save(preferences);
    return preferences.toPrimitives();
  }
}
