import { beforeEach, describe, expect, it } from 'vitest';

import { UpdateChartSeriesPalette } from '@main/user-preferences/application/use-cases/UpdateChartSeriesPalette';
import { InvalidChartSeriesColorFormatError } from '@main/user-preferences/domain/errors/InvalidChartSeriesColorFormatError';

import { UserPreferencesPrimitiveMother } from '../../../shared/domain/primitives/UserPreferencesPrimitiveMother';
import { UserPreferencesRepositoryMock } from '../infrastructure/repositories/UserPreferencesRepositoryMock';

let repository: UserPreferencesRepositoryMock;
let useCase: UpdateChartSeriesPalette;

describe('UpdateChartSeriesPalette', () => {
  beforeEach(() => {
    repository = new UserPreferencesRepositoryMock();
    useCase = new UpdateChartSeriesPalette(repository);
  });

  it('updates and persists the chart series palette', async () => {
    const newPalette = UserPreferencesPrimitiveMother.randomPalette(3);

    const result = await useCase.run(newPalette);

    expect(result.chartSeriesPalette).toEqual(newPalette);
    repository.expectSaveCalledTimes(1);
    repository.expectGetCalledTimes(1);
  });

  it('throws when provided colours are invalid', async () => {
    const invalidPalette = ['rgba(999, 0, 0, 1)'];

    await expect(useCase.run(invalidPalette)).rejects.toBeInstanceOf(
      InvalidChartSeriesColorFormatError,
    );
    repository.expectSaveCalledTimes(0);
    repository.expectGetCalledTimes(1);
  });

  it('persists empty palettes without replacing them with defaults', async () => {
    const result = await useCase.run([]);

    expect(result.chartSeriesPalette).toEqual([]);
    repository.expectSaveCalledTimes(1);
    const persisted = await repository.get();
    expect(persisted.toPrimitives()).toEqual({ chartSeriesPalette: [] });
  });
});
