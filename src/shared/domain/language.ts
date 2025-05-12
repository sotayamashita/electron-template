import { z } from "zod";

/** Supported language locales */
export const SUPPORTED_LOCALES = ["en", "ja"] as const;

/** Language Schema */
export const LanguageSchema = z.enum(SUPPORTED_LOCALES);
export type Language = z.infer<typeof LanguageSchema>;

/** Default language */
export const DEFAULT_LANGUAGE: Language = "en";
