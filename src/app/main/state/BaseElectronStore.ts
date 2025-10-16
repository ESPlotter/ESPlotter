import Store, { type Schema } from 'electron-store';

export abstract class BaseElectronStore<T extends Record<string, unknown>> {
  protected stateStore: Store<T>;

  constructor(name: string, schema: Schema<T>) {
    this.stateStore = new Store<T>({
      name,
      schema,
      // Allow overriding the storage location for tests
      ...(process.env.UNIPLOT_STATE_CWD ? { cwd: process.env.UNIPLOT_STATE_CWD } : {}),
    });
  }
}
