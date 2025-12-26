import { beforeEach, describe, expect, it } from 'vitest';

import { GetUserPreferences } from '@main/user-preferences/application/use-cases/GetUserPreferences';
import { UserPreferences } from '@main/user-preferences/domain/entities/UserPreferences';

import { UserPreferencesPrimitiveMother } from '../../../shared/domain/primitives/UserPreferencesPrimitiveMother';
import { UserPreferencesRepositoryMock } from '../infrastructure/repositories/UserPreferencesRepositoryMock';

let repository: UserPreferencesRepositoryMock;
let useCase: GetUserPreferences;

describe('GetUserPreferences', () => {
  beforeEach(() => {
    repository = new UserPreferencesRepositoryMock();
    useCase = new GetUserPreferences(repository);
  });

  it('returns stored preferences', async () => {
    const stored = UserPreferences.fromPrimitives(UserPreferencesPrimitiveMother.random());
    repository.setPreferences(stored);

    const result = await useCase.run();

    expect(result).toEqual(stored.toPrimitives());
    repository.expectGetCalledTimes(1);
  });
});
