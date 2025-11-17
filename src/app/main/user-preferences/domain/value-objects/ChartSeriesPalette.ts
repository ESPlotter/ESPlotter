import { normalizeChartSeriesColor } from '@shared/domain/validators/normalizeChartSeriesColor';

import { InvalidChartSeriesColorFormatError } from '../errors/InvalidChartSeriesColorFormatError';

export class ChartSeriesPalette {
  static DEFAULT_VALUE: readonly string[] = [
    'rgb(59, 130, 246)',
    'rgb(239, 68, 68)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(99, 102, 241)',
  ];

  private constructor(private colors: string[]) {}

  public static create(colors: string[]): ChartSeriesPalette {
    const normalized = colors.map((color, index) => {
      if (typeof color !== 'string') {
        throw new InvalidChartSeriesColorFormatError(String(color), index);
      }
      const validated = normalizeChartSeriesColor(color);
      if (!validated) {
        throw new InvalidChartSeriesColorFormatError(color, index);
      }
      return validated;
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
}
