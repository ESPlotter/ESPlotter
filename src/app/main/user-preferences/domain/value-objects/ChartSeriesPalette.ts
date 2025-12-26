import { InvalidChartSeriesColorFormatError } from '../errors/InvalidChartSeriesColorFormatError';

export class ChartSeriesPalette {
  static DEFAULT_VALUE: readonly string[] = ['#3a82f4', '#ef4343', '#10b981', '#f59e0b', '#6366f1'];

  private constructor(private colors: string[]) {}

  public static create(colors: string[]): ChartSeriesPalette {
    console.log('prueba');
    
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
