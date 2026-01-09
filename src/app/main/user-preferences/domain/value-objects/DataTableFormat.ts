export class DataTableFormat {
  private constructor(
    private decimals: number,
    private fixed: boolean,
  ) {}

  public static fromPrimitives(primitive: { decimals: number; fixed: boolean }): DataTableFormat {
    return new DataTableFormat(primitive.decimals, primitive.fixed);
  }

  public static withDefaultValues(): DataTableFormat {
    return new DataTableFormat(6, true);
  }

  public static create(decimals: number, fixed: boolean): DataTableFormat {
    if (decimals < 0 || decimals > 15) {
      throw new Error('Decimals must be between 0 and 15');
    }
    return new DataTableFormat(decimals, fixed);
  }

  public toPrimitives(): { decimals: number; fixed: boolean } {
    return {
      decimals: this.decimals,
      fixed: this.fixed,
    };
  }

  public getDecimals(): number {
    return this.decimals;
  }

  public isFixed(): boolean {
    return this.fixed;
  }
}
