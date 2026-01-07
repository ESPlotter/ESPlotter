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
    let hash = 0;
    for (let i = 0; i < 10; i++) {
      hash = (hash << 5) - hash + Math.floor(Math.random() * 256);
      hash |= 0;
    }
    const r = (hash >> 16) & 0xff;
    const g = (hash >> 8) & 0xff;
    const b = hash & 0xff;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}
