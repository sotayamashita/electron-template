/**
 * Abstract Persistence Store Interface
 * Defines standard operations for key-value persistence
 */
export interface PersistenceStore {
  /**
   * Retrieve a value by key
   * @param key The store key
   * @returns The stored value or undefined
   */
  get<T>(key: string): Promise<T>;

  /**
   * Store a value by key
   * @param key The store key
   * @param value The value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Check if a key exists
   * @param key The store key
   * @returns True if the key exists
   */
  has?(key: string): Promise<boolean>;

  /**
   * Delete a key
   * @param key The store key to delete
   */
  delete?(key: string): Promise<void>;
}
