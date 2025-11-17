import Store, { type Schema } from 'electron-store';

type StoreRecord = Record<string, unknown>;

export abstract class BaseElectronStore<T extends StoreRecord> {
  private static stores = new Map<string, Store<StoreRecord>>();

  protected store: Store<T>;

  protected constructor(name: string, schema: Schema<T>) {
    const existing = BaseElectronStore.stores.get(name);
    if (existing) {
      this.store = existing as Store<T>;
      return;
    }

    const store = new Store<T>({
      name,
      schema,
      ...(process.env.UNIPLOT_STATE_CWD ? { cwd: process.env.UNIPLOT_STATE_CWD } : {}),
    });

    BaseElectronStore.stores.set(name, store as Store<StoreRecord>);
    this.store = store;
  }
}
