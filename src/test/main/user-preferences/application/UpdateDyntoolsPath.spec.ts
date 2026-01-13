import { beforeEach, describe, expect, it } from 'vitest';

import { UpdateDyntoolsPath } from '@main/user-preferences/application/use-cases/UpdateDyntoolsPath';

import { UserPreferencesRepositoryMock } from '../infrastructure/repositories/UserPreferencesRepositoryMock';

let repository: UserPreferencesRepositoryMock;
let useCase: UpdateDyntoolsPath;

describe('UpdateDyntoolsPath', () => {
  beforeEach(() => {
    repository = new UserPreferencesRepositoryMock();
    useCase = new UpdateDyntoolsPath(repository);
  });

  it('updates and persists the dyntools path', async () => {
    const newPath = 'D:\\PSSPY313';

    const result = await useCase.run(newPath);

    expect(result.general.paths.dyntoolsPath).toBe(newPath);
    repository.expectSaveCalledTimes(1);
    repository.expectGetCalledTimes(1);
  });
});
