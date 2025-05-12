import type { Language } from "#shared/domain/language.js";
import type { Theme } from "#shared/domain/theme.js";
import type { Todo } from "#shared/domain/todo.js";
import { ElectronPersistenceStore } from "./electron-store.js";
import type { PersistenceStore } from "./store-interface.js";

/**
 * Application store schema
 * Defines all keys and their corresponding types in the store
 */
export type StoreSchema = {
  todos: Todo[];
  theme: Theme;
  userLanguage: Language;
};

/** Typed Store interface that knows about our schema */
export interface TypedStore {
  get<K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K]>;
  set<K extends keyof StoreSchema>(
    key: K,
    value: StoreSchema[K],
  ): Promise<void>;
  has<K extends keyof StoreSchema>(key: K): Promise<boolean>;
}

/**
 * Store wrapper that provides type-safety for our application's schema
 */
class AppStore implements TypedStore {
  constructor(private store: PersistenceStore) {}

  async get<K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K]> {
    return this.store.get<StoreSchema[K]>(key as string);
  }

  async set<K extends keyof StoreSchema>(
    key: K,
    value: StoreSchema[K],
  ): Promise<void> {
    return this.store.set(key as string, value);
  }

  async has<K extends keyof StoreSchema>(key: K): Promise<boolean> {
    return this.store.has ? this.store.has(key as string) : false;
  }
}

/** Singleton instance */
let instance: TypedStore | undefined;

/**
 * Returns the shared store instance.
 * Wraps the electron-store with our schema-aware interface.
 */
export async function getAppStore(): Promise<TypedStore> {
  if (instance) return instance;

  const electronStore = new ElectronPersistenceStore({
    name: "settings",
    defaults: {
      todos: [],
      theme: "system",
      userLanguage: "en",
    },
  });

  instance = new AppStore(electronStore);
  return instance;
}

/**
 * @deprecated Use getAppStore() instead
 */
export const getStore = getAppStore;
