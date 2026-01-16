import { UserPreferencesPrimitive } from '@shared/domain/primitives/UserPreferencesPrimitive';

import { ChartSeriesPalette } from '../value-objects/ChartSeriesPalette';
import { DyntoolsPath } from '../value-objects/DyntoolsPath';
import { PythonPath } from '../value-objects/PythonPath';

export class UserPreferences {
  private constructor(
    private chartSeriesPalette: ChartSeriesPalette,
    private dyntoolsPath: DyntoolsPath,
    private pythonPath: PythonPath,
  ) {}

  public static fromPrimitives(primitive: UserPreferencesPrimitive): UserPreferences {
    return new UserPreferences(
      ChartSeriesPalette.fromPrimitives(primitive.chartSeriesPalette),
      DyntoolsPath.fromPrimitives(primitive.general.paths.dyntoolsPath),
      PythonPath.fromPrimitives(primitive.general.paths.pythonPath),
    );
  }

  public static withDefaultChartSeriesPalette(): UserPreferences {
    return new UserPreferences(
      ChartSeriesPalette.withDefaultValues(),
      DyntoolsPath.withDefaultValue(),
      PythonPath.withDefaultValue(),
    );
  }

  public toPrimitives(): UserPreferencesPrimitive {
    return {
      chartSeriesPalette: this.chartSeriesPalette.toPrimitives(),
      general: {
        paths: {
          dyntoolsPath: this.dyntoolsPath.toPrimitives(),
          pythonPath: this.pythonPath.toPrimitives(),
        },
      },
    };
  }

  public updateChartSeriesPalette(colors: string[]) {
    this.chartSeriesPalette = ChartSeriesPalette.create(colors);
  }

  public updateDyntoolsPath(path: string) {
    this.dyntoolsPath = DyntoolsPath.create(path);
  }

  public updatePythonPath(path: string) {
    this.pythonPath = PythonPath.create(path);
  }
}
