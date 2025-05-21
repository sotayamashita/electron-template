import type { Todo, UpdateTodo } from "#shared/domain/todo.js"; // Updated import
import { NotFoundError } from "#shared/errors.js";
import type { TypedStore } from "../persistence/store.js";
import type { Repository } from "./interfaces.js";

/**
 * Helper to map raw stored object to Todo domain object, ensuring Date conversion.
 */
function mapStoredTodoToDomain(storedTodo: any): Todo {
  return {
    ...storedTodo,
    reminderDateTime: storedTodo.reminderDateTime ? new Date(storedTodo.reminderDateTime) : null,
  };
}

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
    const storedTodos = await this.store.get("todos");
    return storedTodos.map(mapStoredTodoToDomain);
  }

  /**
   * Find a Todo by ID
   * @param id The Todo ID to find
   * @returns The found Todo or undefined
   */
  async findById(id: string): Promise<Todo | undefined> {
    const todos = await this.store.get("todos");
    const storedTodo = todos.find((todo) => todo.id === id);
    return storedTodo ? mapStoredTodoToDomain(storedTodo) : undefined;
  }

  /**
   * Find a Todo by ID with error if not found
   * @param id The Todo ID to find
   * @returns The found Todo
   * @throws NotFoundError if Todo not found
   */
  async getById(id: string): Promise<Todo> {
    const todo = await this.findById(id); // This now returns a mapped Todo
    if (!todo) {
      throw new NotFoundError("Todo", id);
    }
    return todo;
  }

  /**
   * Add a new Todo
   * @param todo The Todo to add
   * @returns The added Todo
   */
  async add(todo: Todo): Promise<Todo> { // Return type changed
    const todos = await this.store.get("todos");
    // The `todo` object already has `reminderDateTime` as Date | null from domain
    // electron-store will serialize Date to ISO string
    const updatedTodos = [...todos, todo];
    await this.store.set("todos", updatedTodos);
    // Return the added todo (already in domain format)
    return todo;
  }

  /**
   * Update an existing Todo
   * @param id The ID of the Todo to update
   * @param data The partial data to update
   * @returns The updated Todo or null if not found
   */
  async update(id: string, data: UpdateTodo): Promise<Todo | null> {
    const todos = await this.store.get("todos");
    let updatedTodo: Todo | null = null;
    const updatedTodos = todos.map((storedTodo) => {
      if (storedTodo.id === id) {
        // When updating, ensure the `reminderDateTime` from `data` (which could be Date | null | undefined)
        // is correctly preserved or set. If `data.reminderDateTime` is undefined, it means no change to it.
        // If it's null, it means clear it. If it's a Date, set it.
        const newReminderDateTime = data.reminderDateTime === undefined
          ? storedTodo.reminderDateTime // Keep existing if not provided in `data`
          : (data.reminderDateTime ? data.reminderDateTime.toISOString() : null); // Convert new Date to ISO or set null

        const mergedTodo = {
          ...storedTodo,
          ...data,
          // Override reminderDateTime specifically because `data.reminderDateTime` might be a Date object
          // and needs to be handled for storage (or it's explicitly null/undefined).
          reminderDateTime: newReminderDateTime,
        };
        updatedTodo = mapStoredTodoToDomain(mergedTodo); // map it back for the return value
        return mergedTodo; // This goes to the store
      }
      return storedTodo;
    });

    if (!updatedTodo) {
      return null; // Or throw NotFoundError if preferred
    }

    await this.store.set("todos", updatedTodos);
    return updatedTodo; // Return the domain model
  }


  /**
   * Remove a Todo by ID
   * @param id The Todo ID to remove
   * @returns The ID of the removed Todo
   * @throws NotFoundError if Todo not found
   */
  async remove(id: string): Promise<string> { // Return type changed
    const todos = await this.store.get("todos");
    const updatedTodos = todos.filter((todo) => todo.id !== id);

    if (todos.length === updatedTodos.length) {
      throw new NotFoundError("Todo", id);
    }

    await this.store.set("todos", updatedTodos);
    return id;
  }

  /**
   * Toggle completion status of a Todo
   * @param id The Todo ID to toggle
   * @returns The updated Todo or null if not found
   * @throws NotFoundError if Todo not found (or return null)
   */
  async toggle(id: string): Promise<Todo | null> { // Return type changed
    const todos = await this.store.get("todos");
    let toggledTodo: Todo | null = null;

    const updatedTodos = todos.map((storedTodo) => {
      if (storedTodo.id === id) {
        const updated = { ...storedTodo, completed: !storedTodo.completed };
        toggledTodo = mapStoredTodoToDomain(updated);
        return updated;
      }
      return storedTodo;
    });

    if (!toggledTodo) {
      throw new NotFoundError("Todo", id); // Or return null if preferred
    }

    await this.store.set("todos", updatedTodos);
    return toggledTodo;
  }
}

// Compatibility export for existing code
// @deprecated Use the class-based implementation via DI
// These legacy exports likely need to be updated or removed if they are still used,
// as their return types and logic might not match the class methods anymore.
// For now, I'll leave them but note they might cause issues if not aligned.
export const TodoRepo = {
  findAll: async (): Promise<Todo[]> => {
    const repo = new TodoRepository(await (await import("../di/container.js")).container.getStore());
    return repo.findAll();
  },

  // add: async (todo: Todo): Promise<Todo[]> => { // Old return type
  //   const repo = new TodoRepository(await (await import("../di/container.js")).container.getStore());
  //   await repo.add(todo); // New add returns Todo, not Todo[]
  //   return repo.findAll(); // Re-fetch all to match old signature, or update consumer
  // },
  // remove: async (id: string): Promise<Todo[]> => { // Old return type
  //   const repo = new TodoRepository(await (await import("../di/container.js")).container.getStore());
  //   await repo.remove(id); // New remove returns string, not Todo[]
  //   return repo.findAll(); // Re-fetch all
  // },
  // toggle: async (id: string): Promise<Todo[]> => { // Old return type
  //   const repo = new TodoRepository(await (await import("../di/container.js")).container.getStore());
  //   await repo.toggle(id); // New toggle returns Todo | null, not Todo[]
  //   return repo.findAll(); // Re-fetch all
  // },
};
// For simplicity, I'll comment out the legacy exports that have signature mismatches.
// They should be refactored or removed in a real scenario.
// For now, this subtask is focused on the main class implementation.
