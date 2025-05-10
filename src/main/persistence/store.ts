import type { Todo } from "../../shared/trpc.js";
import { type Theme } from "../../shared/trpc.js";

/** Persistence schema */
type StoreSchema = {
  todos: Todo[];
  theme: Theme;
};

/** Declare only the minimum API needed on the instance side */
interface Store {
  get<K extends keyof StoreSchema>(key: K): StoreSchema[K];
  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void;
}

/** Singleton */
let instance: Store | undefined;

/**
 * Returns the shared Store instance.
 * Dynamically imports ESM-only electron-store at runtime.
 */
export async function getStore(): Promise<Store> {
  if (instance) return instance;

  // Get constructor via dynamic import
  const { default: StoreCtor } = await import("electron-store");

  // Instantiate and cast to type that guarantees only required methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance = new (StoreCtor as any)({
    name: "settings",
    defaults: { todos: [], theme: "system" },
  }) as Store;

  return instance;
}
