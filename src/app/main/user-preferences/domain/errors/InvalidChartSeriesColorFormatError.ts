export class InvalidChartSeriesColorFormatError extends Error {
  constructor(
    public readonly value: string,
    public readonly index: number,
  ) {
    super(`Color at index ${index} must be a valid hex string: "${value}".`);
    this.name = 'InvalidChartSeriesColorFormatError';
  }
}
