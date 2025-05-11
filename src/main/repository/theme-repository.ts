import type { Theme } from "#shared/domain/theme.js";
import { getStore } from "../persistence/store.js";

/**
 * Repository for persisting UI theme preference.
 * Values: 'light' | 'dark' | 'system'
 */
export const ThemeRepo = {
  async get(): Promise<Theme> {
    return (await getStore()).get("theme");
  },

  async set(value: Theme): Promise<Theme> {
    const store = await getStore();
    store.set("theme", value);
    return value;
  },
};
