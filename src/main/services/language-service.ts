import type { Language } from "#shared/domain/language.js";
import { LanguageSchema } from "#shared/domain/language.js";
import { ValidationError } from "#shared/errors.js";
import { BrowserWindow } from "electron";
import { changeLanguage } from "../i18n/index.js";
import type { LanguageRepository } from "../repository/language-repository.js";

/**
 * Service for handling Language business logic
 */
export class LanguageService {
  /**
   * Create a new LanguageService
   * @param repository The Language repository
   */
  constructor(private repository: LanguageRepository) {}

  /**
   * Get the current language
   * @returns The current language
   */
  async getCurrentLanguage(): Promise<Language> {
    return this.repository.get();
  }

  /**
   * Set a new language
   * @param language The language to set
   * @returns The updated language
   */
  async setLanguage(language: Language): Promise<Language> {
    console.log(`[LanguageService] Setting language to: ${language}`);

    // Validate language using Zod schema
    const result = LanguageSchema.safeParse(language);
    if (!result.success) {
      console.error("[LanguageService] Validation error:", result.error);
      throw new ValidationError("Invalid language value", result.error);
    }

    // Don't do anything if language hasn't changed
    const currentLanguage = await this.getCurrentLanguage();
    console.log(`[LanguageService] Current language: ${currentLanguage}`);

    if (currentLanguage === language) {
      console.log("[LanguageService] Language unchanged, skipping update");
      return language;
    }

    // Persist to store (do this first to avoid race conditions)
    try {
      console.log("[LanguageService] Persisting language to store");
      await this.repository.set(language);
      console.log("[LanguageService] Language persisted successfully");
    } catch (error) {
      console.error("[LanguageService] Error persisting language:", error);
      throw error;
    }

    // Immediately broadcast to renderer processes
    console.log("[LanguageService] Broadcasting language change to renderers");
    this.broadcastLanguageChange(language);

    // Change language in main process (this can be time-consuming)
    // We do this last since it doesn't affect the UI responsiveness
    changeLanguage(language).catch((err) => {
      console.error(
        "[LanguageService] Error changing main process language:",
        err,
      );
    });

    return language;
  }

  /**
   * Broadcasts language change to all renderer processes
   * @param language The new language
   */
  private broadcastLanguageChange(language: Language): void {
    // Get all windows
    const windows = BrowserWindow.getAllWindows();

    // Send event to each window
    for (const window of windows) {
      if (!window.isDestroyed() && window.webContents) {
        window.webContents.send("language-changed", language);
      }
    }
  }
}
