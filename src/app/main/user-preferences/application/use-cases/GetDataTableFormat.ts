import { UserPreferencesRepository } from '../../domain/repositories/UserPreferencesRepository';

export class GetDataTableFormat {
  constructor(private repository: UserPreferencesRepository) {}

  public async execute(): Promise<{ decimals: number; fixed: boolean }> {
    const preferences = await this.repository.get();
    return preferences.toPrimitives().dataTableFormat;
  }
}
