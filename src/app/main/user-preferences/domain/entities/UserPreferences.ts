import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { ChartSeriesPalette } from '../value-objects/ChartSeriesPalette';

export class UserPreferences {
  private constructor(private chartSeriesPalette: ChartSeriesPalette) {}

  public static fromPrimitives(primitive: UserPreferencesPrimitive): UserPreferences {
    return new UserPreferences(ChartSeriesPalette.fromPrimitives(primitive.chartSeriesPalette));
  }

  public static withDefaultChartSeriesPalette(): UserPreferences {
    return new UserPreferences(ChartSeriesPalette.withDefaultValues());
  }

  public toPrimitives(): UserPreferencesPrimitive {
    return {
      chartSeriesPalette: this.chartSeriesPalette.toPrimitives(),
    };
  }

  public updateChartSeriesPalette(colors: string[]) {
    this.chartSeriesPalette = ChartSeriesPalette.create(colors);
  }
}
