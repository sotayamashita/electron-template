/**
 * Dependency Injection Container
 * Central location for managing application dependencies
 */

import type { TypedStore } from "../persistence/store.js";
import { getAppStore } from "../persistence/store.js";
import { ThemeRepository } from "../repository/theme-repository.js";
import { TodoRepository } from "../repository/todo-repository.js";

/**
 * Lazy-loaded singleton container for application dependencies
 */
class DIContainer {
  private initialized = false;
  private store: TypedStore | undefined;
  private todoRepository: TodoRepository | undefined;
  private themeRepository: ThemeRepository | undefined;

  /**
   * Ensure container is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    // Initialize core dependencies
    this.store = await getAppStore();

    // Initialize repositories
    this.todoRepository = new TodoRepository(this.store);
    this.themeRepository = new ThemeRepository(this.store);

    this.initialized = true;
  }

  /**
   * Get the application store
   */
  async getStore(): Promise<TypedStore> {
    await this.ensureInitialized();
    return this.store!;
  }

  /**
   * Get the Todo repository
   */
  async getTodoRepository(): Promise<TodoRepository> {
    await this.ensureInitialized();
    return this.todoRepository!;
  }

  /**
   * Get the Theme repository
   */
  async getThemeRepository(): Promise<ThemeRepository> {
    await this.ensureInitialized();
    return this.themeRepository!;
  }
}

// Export singleton instance
export const container = new DIContainer();
