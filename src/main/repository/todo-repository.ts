import type { Todo } from "../../shared/trpc.js";
import { getStore } from "../persistence/store.js";

/**
 * Repository layer for Todo entities.
 * Provides CRUD operations backed by electron‑store (v10).
 */
export const TodoRepo = {
  /**
   * Get all todos.
   */
  async findAll(): Promise<Todo[]> {
    return (await getStore()).get("todos");
  },

  /**
   * Append a new todo and return the updated list.
   */
  async add(todo: Todo): Promise<Todo[]> {
    const store = await getStore();
    const todos = store.get("todos");
    store.set("todos", [...todos, todo]);
    return store.get("todos");
  },

  /**
   * Remove a todo by id and return the updated list.
   */
  async remove(id: string): Promise<Todo[]> {
    const store = await getStore();
    const next = (store.get("todos") as Todo[]).filter((t) => t.id !== id);
    store.set("todos", next);
    return next;
  },

  /**
   * Toggle the `completed` flag of a todo by id.
   * Expects each Todo to have a boolean `completed` property.
   */
  async toggle(id: string): Promise<Todo[]> {
    const store = await getStore();
    const next = (store.get("todos") as Todo[]).map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    store.set("todos", next);
    return next;
  },
};
