import type { Theme } from "#shared/domain/theme.js";
import { ThemeSchema } from "#shared/domain/theme.js";
import { ValidationError } from "#shared/errors.js";
import { ThemeRepository } from "../repository/theme-repository.js";

/**
 * Service for handling Theme business logic
 */
export class ThemeService {
  /**
   * Create a new ThemeService
   * @param repository The Theme repository
   */
  constructor(private repository: ThemeRepository) {}

  /**
   * Get the current theme
   * @returns The current theme
   */
  async getCurrentTheme(): Promise<Theme> {
    return this.repository.get();
  }

  /**
   * Set a new theme
   * @param theme The theme to set
   * @returns The updated theme
   */
  async setTheme(theme: Theme): Promise<Theme> {
    // Validate theme using Zod schema
    const result = ThemeSchema.safeParse(theme);
    if (!result.success) {
      throw new ValidationError("Invalid theme value", result.error);
    }

    return this.repository.set(theme);
  }
}
