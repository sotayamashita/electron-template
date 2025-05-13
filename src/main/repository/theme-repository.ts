import type { Theme } from "#shared/domain/theme.js";
import type { TypedStore } from "../persistence/store.js";

/**
 * Repository for persisting UI theme preference.
 * Values: 'light' | 'dark' | 'system'
 */
export class ThemeRepository {
  /**
   * Create a new ThemeRepository
   * @param store The storage provider
   */
  constructor(private store: TypedStore) {}

  /**
   * Get the current theme
   * @returns The current theme value
   */
  async get(): Promise<Theme> {
    return this.store.get("theme");
  }

  /**
   * Set a new theme
   * @param value The new theme value
   * @returns The updated theme value
   */
  async set(value: Theme): Promise<Theme> {
    await this.store.set("theme", value);
    return value;
  }
}

// Compatibility export for existing code
// @deprecated Use the class-based implementation via DI
export const ThemeRepo = {
  get: async (): Promise<Theme> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new ThemeRepository(store).get());
  },

  set: async (value: Theme): Promise<Theme> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new ThemeRepository(store).set(value));
  },
};
