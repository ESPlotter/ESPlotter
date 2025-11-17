import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';
import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

export class UserPreferencesPrimitiveMother {
  static with(data: PartialDeep<UserPreferencesPrimitive> = {}): UserPreferencesPrimitive {
    return {
      chartSeriesPalette:
        data.chartSeriesPalette?.map((value) => value as string) ??
        UserPreferencesPrimitiveMother.randomPalette(),
    };
  }

  static random(): UserPreferencesPrimitive {
    return UserPreferencesPrimitiveMother.with();
  }

  static randomPalette(size: number = 5): string[] {
    return Array.from({ length: size }, (_, index) => {
      if (index < DEFAULT_CHART_SERIES_PALETTE.length) {
        return DEFAULT_CHART_SERIES_PALETTE[index];
      }
      return UserPreferencesPrimitiveMother.randomColor();
    });
  }

  static randomColor(): string {
    const format = faker.helpers.arrayElement(['rgb', 'rgba']);
    const r = faker.number.int({ min: 0, max: 255 });
    const g = faker.number.int({ min: 0, max: 255 });
    const b = faker.number.int({ min: 0, max: 255 });
    if (format === 'rgb') {
      return `rgb(${r}, ${g}, ${b})`;
    }
    const a = faker.number.float({ min: 0, max: 1, fractionDigits: 2 });
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}
