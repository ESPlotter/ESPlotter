import { DEFAULT_CHART_SERIES_PALETTE } from '../../../../shared/domain/constants/defaultChartSeriesPalette';
import { InvalidChartSeriesColorFormatError } from '../errors/InvalidChartSeriesColorFormatError';

export class ChartSeriesPalette {
  static DEFAULT_VALUE: readonly string[] = DEFAULT_CHART_SERIES_PALETTE;

  private constructor(private colors: string[]) {}

  public static create(colors: string[]): ChartSeriesPalette {
    const normalized = colors.map((color, index) => {
      if (typeof color !== 'string') {
        throw new InvalidChartSeriesColorFormatError(String(color), index);
      }
      if (!this.isHexColorString(color)) {
        throw new InvalidChartSeriesColorFormatError(color, index);
      }
      return color;
    });

    return new ChartSeriesPalette(normalized);
  }

  public static withDefaultValues(): ChartSeriesPalette {
    return ChartSeriesPalette.create([...ChartSeriesPalette.DEFAULT_VALUE]);
  }

  public static fromPrimitives(colors: string[]): ChartSeriesPalette {
    return ChartSeriesPalette.create(colors);
  }

  public toPrimitives(): string[] {
    return [...this.colors];
  }

  private static isHexColorString(value: string): boolean {
    return /^#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})$/.test(value); // Matches #RRGGBB, #RGB, #RRGGBBAA, #RGBA
  }
}
