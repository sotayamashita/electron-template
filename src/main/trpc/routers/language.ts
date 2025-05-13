import { LanguageSchema } from "#shared/domain/language.js";
import { languageService } from "../../services/index.js";
import { publicProcedure, router } from "../core.js";

/**
 * Language router
 * Handles API endpoints for language operations
 */
export const languageRouter = router({
  /** Get current language */
  get: publicProcedure.query(async () => {
    return languageService.getCurrentLanguage();
  }),

  /** Set a new language */
  set: publicProcedure.input(LanguageSchema).mutation(async ({ input }) => {
    console.log(`[TRPC LANGUAGE ROUTER] Setting language: ${input}`);

    try {
      // Use the proper service method which handles persistence through ElectronStore
      const result = await languageService.setLanguage(input);
      console.log(
        `[TRPC LANGUAGE ROUTER] Language set successfully: ${result}`,
      );
      return result;
    } catch (error) {
      console.error(`[TRPC LANGUAGE ROUTER] Error setting language:`, error);
      throw error;
    }
  }),
});
