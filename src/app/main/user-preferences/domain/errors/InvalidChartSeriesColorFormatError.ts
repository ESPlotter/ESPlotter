export class InvalidChartSeriesColorFormatError extends Error {
  constructor(public readonly value: string, public readonly index: number) {
    super(`Color at index ${index} must be a valid rgb(...) or rgba(...) string: "${value}".`);
    this.name = 'InvalidChartSeriesColorFormatError';
  }
}
