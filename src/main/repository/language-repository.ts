import type { Language } from "#shared/domain/language.js";
import { LanguageSchema } from "#shared/domain/language.js";
import type { TypedStore } from "../persistence/store.js";

/**
 * Repository for persisting language preference.
 * Ensures that only valid languages from SUPPORTED_LOCALES are stored.
 */
export class LanguageRepository {
  /**
   * Create a new LanguageRepository
   * @param store The storage provider
   */
  constructor(private store: TypedStore) {}

  /**
   * Get the current language
   * @returns The current language code
   */
  async get(): Promise<Language> {
    try {
      console.log("[LanguageRepository] Getting stored language");
      const lang = await this.store.get("userLanguage");
      console.log(`[LanguageRepository] Retrieved language: ${lang}`);
      return lang;
    } catch (error) {
      console.error("[LanguageRepository] Error getting language:", error);
      throw error;
    }
  }

  /**
   * Set a new language
   * @param value The new language code
   * @returns The updated language
   */
  async set(value: Language): Promise<Language> {
    console.log(`[LanguageRepository] Setting language: ${value}`);

    // Validate against schema
    const result = LanguageSchema.safeParse(value);
    if (!result.success) {
      console.error("[LanguageRepository] Validation error:", result.error);
      throw new Error(`Invalid language: ${value}`);
    }

    try {
      await this.store.set("userLanguage", value);
      console.log(`[LanguageRepository] Language set successfully: ${value}`);
      return value;
    } catch (error) {
      console.error("[LanguageRepository] Error setting language:", error);
      throw error;
    }
  }
}

// Compatibility export for existing code
// @deprecated Use the class-based implementation via DI
export const LanguageRepo = {
  get: async (): Promise<Language> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new LanguageRepository(store).get());
  },

  set: async (value: Language): Promise<Language> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new LanguageRepository(store).set(value));
  },
};
