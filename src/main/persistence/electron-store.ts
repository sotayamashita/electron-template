import type { PersistenceStore } from "./store-interface.js";

/**
 * Electron Store Implementation
 * Provides persistence via electron-store package
 */
export class ElectronPersistenceStore implements PersistenceStore {
  private store: unknown; // Using unknown as electron-store is dynamically imported

  /**
   * Create a new store instance
   * @param options Store configuration options
   */
  constructor(
    private options: {
      name: string;
      defaults?: Record<string, unknown>;
    },
  ) {}

  /**
   * Initialize the store (lazy loading)
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.store) {
      const { default: StoreCtor } = await import("electron-store");
      this.store = new StoreCtor(this.options);
    }
  }

  /**
   * Get a value from the store
   * @param key The key to retrieve
   * @returns The stored value
   */
  async get<T>(key: string): Promise<T> {
    await this.ensureInitialized();
    const store = this.store as { get(key: string): unknown };
    return store.get(key) as T;
  }

  /**
   * Set a value in the store
   * @param key The key to set
   * @param value The value to store
   */
  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureInitialized();
    const store = this.store as { set(key: string, value: unknown): void };
    store.set(key, value);
  }

  /**
   * Check if a key exists in the store
   * @param key The key to check
   * @returns True if the key exists
   */
  async has(key: string): Promise<boolean> {
    await this.ensureInitialized();
    const store = this.store as { has(key: string): boolean };
    return store.has(key);
  }

  /**
   * Delete a key from the store
   * @param key The key to delete
   */
  async delete(key: string): Promise<void> {
    await this.ensureInitialized();
    const store = this.store as { delete(key: string): void };
    store.delete(key);
  }
}
