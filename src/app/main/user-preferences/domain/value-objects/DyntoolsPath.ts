import { DEFAULT_DYNTOOLS_PATH } from '@shared/domain/constants/defaultDyntoolsPath';

export class DyntoolsPath {
  static DEFAULT_VALUE: string = DEFAULT_DYNTOOLS_PATH;

  private constructor(private value: string) {}

  public static create(value: string | null | undefined): DyntoolsPath {
    if (typeof value !== 'string') {
      return new DyntoolsPath(this.DEFAULT_VALUE);
    }

    const normalized = value.trim();
    return new DyntoolsPath(normalized.length > 0 ? normalized : this.DEFAULT_VALUE);
  }

  public static withDefaultValue(): DyntoolsPath {
    return new DyntoolsPath(this.DEFAULT_VALUE);
  }

  public static fromPrimitives(value: string): DyntoolsPath {
    return DyntoolsPath.create(value);
  }

  public toPrimitives(): string {
    return this.value;
  }
}
