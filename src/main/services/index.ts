import type { Language } from "#shared/domain/language.js";
import type { Theme } from "#shared/domain/theme.js";
import { container } from "../di/container.js";
import { LanguageService } from "./language-service.js";
import { ThemeService } from "./theme-service.js";
import { TodoService } from "./todo-service.js";

// Export service factory functions
export const createTodoService = async (): Promise<TodoService> => {
  const repository = await container.getTodoRepository();
  return new TodoService(repository);
};

export const createThemeService = async (): Promise<ThemeService> => {
  const repository = await container.getThemeRepository();
  return new ThemeService(repository);
};

export const createLanguageService = async (): Promise<LanguageService> => {
  const repository = await container.getLanguageRepository();
  return new LanguageService(repository);
};

// Singleton instances for convenience
let todoServiceInstance: TodoService | null = null;
let themeServiceInstance: ThemeService | null = null;
let languageServiceInstance: LanguageService | null = null;

// Export singleton getters
export const getTodoService = async (): Promise<TodoService> => {
  if (!todoServiceInstance) {
    todoServiceInstance = await createTodoService();
  }
  return todoServiceInstance;
};

export const getThemeService = async (): Promise<ThemeService> => {
  if (!themeServiceInstance) {
    themeServiceInstance = await createThemeService();
  }
  return themeServiceInstance;
};

export const getLanguageService = async (): Promise<LanguageService> => {
  if (!languageServiceInstance) {
    languageServiceInstance = await createLanguageService();
  }
  return languageServiceInstance;
};

// Export singletons directly for convenience (lazy initialization)
export const todoService = {
  getAll: () => getTodoService().then((service) => service.getAll()),
  createTodo: (title: string) =>
    getTodoService().then((service) => service.createTodo(title)),
  toggleTodo: (id: string) =>
    getTodoService().then((service) => service.toggleTodo(id)),
  removeTodo: (id: string) =>
    getTodoService().then((service) => service.removeTodo(id)),
};

export const themeService = {
  getCurrentTheme: () =>
    getThemeService().then((service) => service.getCurrentTheme()),
  setTheme: (theme: unknown) =>
    getThemeService().then((service) => service.setTheme(theme as Theme)),
};

export const languageService = {
  getCurrentLanguage: () =>
    getLanguageService().then((service) => service.getCurrentLanguage()),
  setLanguage: (language: unknown) =>
    getLanguageService().then((service) =>
      service.setLanguage(language as Language),
    ),
};
