import { DEFAULT_PYTHON_PATH } from '@shared/domain/constants/defaultPythonPath';

export class PythonPath {
  static DEFAULT_VALUE: string = DEFAULT_PYTHON_PATH;

  private constructor(private value: string) {}

  public static create(value: string | null | undefined): PythonPath {
    if (typeof value !== 'string') {
      return new PythonPath(this.DEFAULT_VALUE);
    }

    const normalized = value.trim();
    return new PythonPath(normalized.length > 0 ? normalized : this.DEFAULT_VALUE);
  }

  public static withDefaultValue(): PythonPath {
    return new PythonPath(this.DEFAULT_VALUE);
  }

  public static fromPrimitives(value: string): PythonPath {
    return PythonPath.create(value);
  }

  public toPrimitives(): string {
    return this.value;
  }
}
