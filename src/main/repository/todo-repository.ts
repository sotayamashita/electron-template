import type { Todo } from "#shared/domain/todo.js";
import { NotFoundError } from "#shared/errors.js";
import type { TypedStore } from "../persistence/store.js";
import type { Repository } from "./interfaces.js";

/**
 * Repository implementation for Todo entities.
 * Provides CRUD operations backed by persistent storage.
 */
export class TodoRepository implements Repository<Todo, string> {
  /**
   * Create a new TodoRepository
   * @param store The storage provider
   */
  constructor(private store: TypedStore) {}

  /**
   * Get all todos
   * @returns Array of all Todo items
   */
  async findAll(): Promise<Todo[]> {
    return this.store.get("todos");
  }

  /**
   * Find a Todo by ID
   * @param id The Todo ID to find
   * @returns The found Todo or undefined
   */
  async findById(id: string): Promise<Todo | undefined> {
    const todos = await this.store.get("todos");
    return todos.find((todo) => todo.id === id);
  }

  /**
   * Find a Todo by ID with error if not found
   * @param id The Todo ID to find
   * @returns The found Todo
   * @throws NotFoundError if Todo not found
   */
  async getById(id: string): Promise<Todo> {
    const todo = await this.findById(id);
    if (!todo) {
      throw new NotFoundError("Todo", id);
    }
    return todo;
  }

  /**
   * Add a new Todo
   * @param todo The Todo to add
   * @returns The updated Todo list
   */
  async add(todo: Todo): Promise<Todo[]> {
    const todos = await this.store.get("todos");
    const updatedTodos = [...todos, todo];
    await this.store.set("todos", updatedTodos);
    return updatedTodos;
  }

  /**
   * Remove a Todo by ID
   * @param id The Todo ID to remove
   * @returns The updated Todo list
   */
  async remove(id: string): Promise<Todo[]> {
    const todos = await this.store.get("todos");
    const updatedTodos = todos.filter((todo) => todo.id !== id);

    // Verify that a todo was actually removed
    if (todos.length === updatedTodos.length) {
      throw new NotFoundError("Todo", id);
    }

    await this.store.set("todos", updatedTodos);
    return updatedTodos;
  }

  /**
   * Toggle completion status of a Todo
   * @param id The Todo ID to toggle
   * @returns The updated Todo list
   * @throws NotFoundError if Todo not found
   */
  async toggle(id: string): Promise<Todo[]> {
    const todos = await this.store.get("todos");
    let found = false;

    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        found = true;
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    if (!found) {
      throw new NotFoundError("Todo", id);
    }

    await this.store.set("todos", updatedTodos);
    return updatedTodos;
  }
}

// Compatibility export for existing code
// @deprecated Use the class-based implementation via DI
export const TodoRepo = {
  findAll: async (): Promise<Todo[]> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new TodoRepository(store).findAll());
  },

  add: async (todo: Todo): Promise<Todo[]> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new TodoRepository(store).add(todo));
  },

  remove: async (id: string): Promise<Todo[]> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new TodoRepository(store).remove(id));
  },

  toggle: async (id: string): Promise<Todo[]> => {
    return (await import("../di/container.js")).container
      .getStore()
      .then((store) => new TodoRepository(store).toggle(id));
  },
};
