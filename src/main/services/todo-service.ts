import { randomUUID } from "node:crypto"; // Added import
import type { CreateTodo, Todo, UpdateTodo } from "#shared/domain/todo.js";
import { CreateTodoSchema, UpdateTodoSchema } from "#shared/domain/todo.js";
import { ValidationError } from "#shared/errors.js";
import type { TodoRepository } from "../repository/todo-repository.js";
import type { NotificationService } from "./notification-service.js"; // Added import

/**
 * Service for handling Todo business logic
 */
export class TodoService {
  /**
   * Create a new TodoService
   * @param repository The Todo repository
   * @param notificationService The Notification service
   */
  constructor(
    private repository: TodoRepository,
    private notificationService: NotificationService, // Added
  ) {}

  /**
   * Get all todos
   * @returns List of all todos
   */
  async getAll(): Promise<Todo[]> {
    return this.repository.findAll();
  }

  /**
   * Create a new todo
   * @param data The todo data
   * @returns The created todo
   */
  async createTodo(data: CreateTodo): Promise<Todo> { // Updated signature
    const validationResult = CreateTodoSchema.safeParse(data);
    if (!validationResult.success) {
      throw new ValidationError(`Invalid todo data: ${JSON.stringify(validationResult.error.format())}`);
    }

    const newTodo: Todo = {
      id: randomUUID(), // Updated to use imported function
      title: validationResult.data.title.trim(),
      completed: false,
      reminderDateTime: validationResult.data.reminderDateTime || null, // Ensure null if undefined
    };

    const createdTodo = await this.repository.add(newTodo); // Assuming add now returns the single created todo or we adapt
    this.notificationService.scheduleNotification(createdTodo);
    return createdTodo;
  }

  /**
   * Update an existing todo
   * @param id The todo ID
   * @param data The partial todo data to update
   * @returns The updated todo
   */
  async updateTodo(id: string, data: UpdateTodo): Promise<Todo | null> { // Added method
    if (!id) {
      throw new ValidationError("Todo ID is required for update");
    }
    const validationResult = UpdateTodoSchema.safeParse(data);
    if (!validationResult.success) {
      throw new ValidationError(`Invalid update data: ${validationResult.error.format()}`);
    }

    const updatedTodo = await this.repository.update(id, validationResult.data);
    if (updatedTodo) {
      this.notificationService.scheduleNotification(updatedTodo);
    }
    return updatedTodo;
  }

  /**
   * Toggle the completion status of a todo
   * @param id The todo ID
   * @returns The updated todo
   */
  async toggleTodo(id: string): Promise<Todo | null> { // Updated return type
    if (!id) {
      throw new ValidationError("Todo ID is required");
    }
    // This repository method might need adjustment if it only returns a list
    const todo = await this.repository.toggle(id); // Assuming toggle now returns the toggled todo or null
    if (todo) {
      // If completing a todo, we might want to cancel its notification.
      // If un-completing, and it has a reminder, it should remain scheduled or be re-scheduled.
      // For now, let scheduleNotification handle re-scheduling if reminderDateTime is present and valid.
      this.notificationService.scheduleNotification(todo);
    }
    return todo;
  }

  /**
   * Remove a todo
   * @param id The todo ID
   * @returns The ID of the removed todo
   */
  async removeTodo(id: string): Promise<string> { // Updated return type
    if (!id) {
      throw new ValidationError("Todo ID is required");
    }
    this.notificationService.cancelNotification(id);
    await this.repository.remove(id); // Assuming remove now returns void or the ID
    return id;
  }

  /**
   * Loads all todos and reschedules their notifications.
   * Typically called on application startup.
   */
  async loadAndRescheduleAllNotifications(): Promise<void> { // Added method
    const allTodos = await this.repository.findAll();
    // The reminderDateTime from store might be ISO strings, NotificationService needs to handle this
    const todosWithDateObjects = allTodos.map(todo => ({
      ...todo,
      reminderDateTime: todo.reminderDateTime ? new Date(todo.reminderDateTime) : null,
    }));
    this.notificationService.rescheduleAllNotifications(todosWithDateObjects);
  }
}
