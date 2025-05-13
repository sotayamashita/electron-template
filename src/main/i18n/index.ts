import { app } from "electron";
import i18next from "i18next";
import backend from "i18next-fs-backend";
import path from "node:path";
import { languageService } from "../services/index.js";

/**
 * Initializes i18next for the main process
 * Uses fs-backend to load translations from the filesystem
 */
export async function initI18n(): Promise<typeof i18next> {
  // Get base path for resources
  const resourcesPath = app.isPackaged
    ? path.join(process.resourcesPath, "locales")
    : path.join(app.getAppPath(), "locales");

  // Get the current language preference from storage
  const userLanguage = await languageService.getCurrentLanguage();

  // Initialize i18next
  await i18next.use(backend).init({
    backend: {
      loadPath: path.join(resourcesPath, "{{lng}}/{{ns}}.json"),
    },
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "menu"],
    lng: userLanguage,
    debug: !app.isPackaged,
    nsSeparator: ":", // Explicitly set namespace separator
  });

  return i18next;
}

// Singleton instance
let i18n: typeof i18next | null = null;

/**
 * Get the initialized i18next instance for the main process
 * Initializes the instance if it doesn't already exist
 */
export async function getI18n(): Promise<typeof i18next> {
  if (!i18n) {
    i18n = await initI18n();
  }
  return i18n;
}

/**
 * Changes the language for the main process
 * @param lng The language code to change to
 */
export async function changeLanguage(lng: string): Promise<void> {
  const i18nInstance = await getI18n();
  await i18nInstance.changeLanguage(lng);
}
