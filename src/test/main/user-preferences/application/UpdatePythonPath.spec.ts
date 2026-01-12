import { beforeEach, describe, expect, it } from 'vitest';

import { UpdatePythonPath } from '@main/user-preferences/application/use-cases/UpdatePythonPath';

import { UserPreferencesRepositoryMock } from '../infrastructure/repositories/UserPreferencesRepositoryMock';

let repository: UserPreferencesRepositoryMock;
let useCase: UpdatePythonPath;

describe('UpdatePythonPath', () => {
  beforeEach(() => {
    repository = new UserPreferencesRepositoryMock();
    useCase = new UpdatePythonPath(repository);
  });

  it('updates and persists the python path', async () => {
    const newPath = 'C:\\Python311\\python.exe';

    const result = await useCase.run(newPath);

    expect(result.general.paths.pythonPath).toBe(newPath);
    repository.expectSaveCalledTimes(1);
    repository.expectGetCalledTimes(1);
  });
});
