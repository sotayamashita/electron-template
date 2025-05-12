import { ThemeSchema } from "#shared/domain/theme.js";
import { themeService } from "../../services/index.js";
import { publicProcedure, router } from "../core.js";

/**
 * Theme router
 * Handles API endpoints for theme operations
 */
export const themeRouter = router({
  /** Get current theme */
  get: publicProcedure.query(async () => {
    return themeService.getCurrentTheme();
  }),

  /** Set a new theme */
  set: publicProcedure.input(ThemeSchema).mutation(async ({ input }) => {
    return themeService.setTheme(input);
  }),
});
