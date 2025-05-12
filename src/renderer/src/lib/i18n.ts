import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Default resources in English
const defaultResources = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
    },
  },
};

// Import locales directly
import enCommon from "../../../../locales/en/common.json";
import enMenu from "../../../../locales/en/menu.json";
import jaCommon from "../../../../locales/ja/common.json";
import jaMenu from "../../../../locales/ja/menu.json";

/**
 * Get all locale resources bundled with the application
 * Explicitly imports locale files to ensure they're bundled properly
 */
function getBundledLocales(): Record<
  string,
  Record<string, Record<string, unknown>>
> {
  console.log("Loading bundled locales");

  // Explicitly structure the resources object with imported JSON
  const resources = {
    en: {
      common: enCommon,
      menu: enMenu,
    },
    ja: {
      common: jaCommon,
      menu: jaMenu,
    },
  };

  return resources;
}

/**
 * Bootstrap i18n before React renders to prevent flicker
 * This function is called synchronously during app initialization
 */
export function bootstrapI18n(): typeof i18n {
  // Get the initial language from preload script (synchronously)
  const initialLanguage = window.initialLng || "en";

  // Initialize i18next with React integration
  i18n.use(initReactI18next).init({
    lng: initialLanguage,
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    defaultNS: "common",
    ns: ["common", "menu"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Combine bundled locales with fallback resources
    resources: {
      ...defaultResources,
      ...getBundledLocales(),
    },
  });

  // Listen for language change events from the main process
  window.api.i18n.onLanguageChanged((newLanguage) => {
    i18n.changeLanguage(newLanguage);
  });

  return i18n;
}

/**
 * Set up language change handler to persist changes
 * This ensures the main process is notified when the language is changed
 * in the renderer process
 *
 * NOTE: We're now handling this directly in the LanguageToggle component
 * to improve responsiveness and avoid redundant calls.
 */
export function setupLanguageChangeHandler(): void {
  // No-op - language changes are now handled directly in the UI components
  // for better responsiveness and UX
}

// Initialize synchronously to provide the instance as a singleton
export default bootstrapI18n();
