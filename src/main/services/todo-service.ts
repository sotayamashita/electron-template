import type { Todo } from "#shared/domain/todo.js";
import { ValidationError } from "#shared/errors.js";
import { TodoRepository } from "../repository/todo-repository.js";

/**
 * Service for handling Todo business logic
 */
export class TodoService {
  /**
   * Create a new TodoService
   * @param repository The Todo repository
   */
  constructor(private repository: TodoRepository) {}

  /**
   * Get all todos
   * @returns List of all todos
   */
  async getAll(): Promise<Todo[]> {
    return this.repository.findAll();
  }

  /**
   * Create a new todo
   * @param title The todo title
   * @returns The updated todo list
   */
  async createTodo(title: string): Promise<Todo[]> {
    if (!title || !title.trim()) {
      throw new ValidationError("Todo title cannot be empty");
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
    };

    return this.repository.add(newTodo);
  }

  /**
   * Toggle the completion status of a todo
   * @param id The todo ID
   * @returns The updated todo list
   */
  async toggleTodo(id: string): Promise<Todo[]> {
    if (!id) {
      throw new ValidationError("Todo ID is required");
    }

    return this.repository.toggle(id);
  }

  /**
   * Remove a todo
   * @param id The todo ID
   * @returns The updated todo list
   */
  async removeTodo(id: string): Promise<Todo[]> {
    if (!id) {
      throw new ValidationError("Todo ID is required");
    }

    return this.repository.remove(id);
  }
}
