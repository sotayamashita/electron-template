import type { Todo } from "#shared/domain/todo.js";

export const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: `todo-${Math.random().toString(36).substr(2, 9)}`,
  title: "Test Todo",
  completed: false,
  ...overrides,
});
