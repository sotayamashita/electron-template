import { getStore } from "../persistence/store.js";

/**
 * Repository for persisting UI theme preference.
 * Values: 'light' | 'dark' | 'system'
 */
export const ThemeRepo = {
  async get(): Promise<"light" | "dark" | "system"> {
    return (await getStore()).get("theme");
  },

  async set(
    value: "light" | "dark" | "system",
  ): Promise<"light" | "dark" | "system"> {
    const store = await getStore();
    store.set("theme", value);
    return value;
  },
};
