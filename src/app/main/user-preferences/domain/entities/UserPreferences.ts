import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { ChartSeriesPalette } from '../value-objects/ChartSeriesPalette';
import { DataTableFormat } from '../value-objects/DataTableFormat';

export class UserPreferences {
  private constructor(
    private chartSeriesPalette: ChartSeriesPalette,
    private dataTableFormat: DataTableFormat,
  ) {}

  public static fromPrimitives(primitive: UserPreferencesPrimitive): UserPreferences {
    return new UserPreferences(
      ChartSeriesPalette.fromPrimitives(primitive.chartSeriesPalette),
      DataTableFormat.fromPrimitives(primitive.dataTableFormat),
    );
  }

  public static withDefaultChartSeriesPalette(): UserPreferences {
    return new UserPreferences(
      ChartSeriesPalette.withDefaultValues(),
      DataTableFormat.withDefaultValues(),
    );
  }

  public toPrimitives(): UserPreferencesPrimitive {
    return {
      chartSeriesPalette: this.chartSeriesPalette.toPrimitives(),
      dataTableFormat: this.dataTableFormat.toPrimitives(),
    };
  }

  public updateChartSeriesPalette(colors: string[]) {
    this.chartSeriesPalette = ChartSeriesPalette.create(colors);
  }

  public updateDataTableFormat(decimals: number, fixed: boolean) {
    this.dataTableFormat = DataTableFormat.create(decimals, fixed);
  }
}
