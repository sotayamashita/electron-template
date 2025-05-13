/**
 * Shared runtime constants.
 * Only place values here that can be safely used in both main and renderer processes.
 */

/** Available theme options in UI */
export const THEME_OPTIONS = ["light", "dark", "system"] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

/** Default theme */
export const DEFAULT_THEME: ThemeOption = "system";

/** Available language options in UI */
export const LANGUAGE_OPTIONS = ["en", "ja"] as const;
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

/** Default language */
export const DEFAULT_LANGUAGE: LanguageOption = "en";
