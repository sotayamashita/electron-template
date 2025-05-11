import { ThemeSchema, type Theme } from "#shared/domain/theme.js";
import { ThemeRepo } from "../../repository/theme-repository.js";
import { publicProcedure, router } from "../core.js";

/**
 * Theme router
 */
export const themeRouter = router({
  /** Get current theme */
  get: publicProcedure.query(async () => {
    return await ThemeRepo.get();
  }),

  /** Set a new theme */
  set: publicProcedure.input(ThemeSchema).mutation(async ({ input }) => {
    return await ThemeRepo.set(input as Theme);
  }),
});
