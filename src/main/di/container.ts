/**
 * Dependency Injection Container
 * Central location for managing application dependencies
 */

import type { TypedStore } from "../persistence/store.js";
import { getAppStore } from "../persistence/store.js";
import { LanguageRepository } from "../repository/language-repository.js";
import { ThemeRepository } from "../repository/theme-repository.js";
import { TodoRepository } from "../repository/todo-repository.js";
import { notificationServiceInstance, NotificationService } from "../services/notification-service.js"; // Added
import { TodoService } from "../services/todo-service.js"; // Added

/**
 * Lazy-loaded singleton container for application dependencies
 */
class DIContainer {
  private initialized = false;
  private store: TypedStore | undefined;
  private todoRepository: TodoRepository | undefined;
  private themeRepository: ThemeRepository | undefined;
  private languageRepository: LanguageRepository | undefined;
  private notificationService: NotificationService | undefined; // Added
  private todoService: TodoService | undefined; // Added

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
    this.languageRepository = new LanguageRepository(this.store);

    // Initialize services
    this.notificationService = notificationServiceInstance; // Added
    this.todoService = new TodoService(this.todoRepository, this.notificationService); // Added

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

  /**
   * Get the Language repository
   */
  async getLanguageRepository(): Promise<LanguageRepository> {
    await this.ensureInitialized();
    return this.languageRepository!;
  }

  /**
   * Get the Notification service
   */
  async getNotificationService(): Promise<NotificationService> { // Added
    await this.ensureInitialized(); // Added
    return this.notificationService!; // Added
  } // Added

  /**
   * Get the Todo service
   */
  async getTodoService(): Promise<TodoService> { // Added
    await this.ensureInitialized(); // Added
    return this.todoService!; // Added
  } // Added
}

// Export singleton instance
export const container = new DIContainer();
