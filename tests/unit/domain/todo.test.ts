import { TodoSchema } from "#shared/domain/todo.js";
import { describe, expect, test } from "vitest";

describe("Todo Domain", () => {
  describe("TodoSchema", () => {
    test("accepts valid todo", () => {
      const validTodo = {
        id: "todo-123",
        title: "Complete unit tests",
        completed: false,
      };
      expect(() => TodoSchema.parse(validTodo)).not.toThrow();
    });

    test("accepts completed todo", () => {
      const validTodo = {
        id: "todo-456",
        title: "Completed task",
        completed: true,
      };
      expect(() => TodoSchema.parse(validTodo)).not.toThrow();
    });

    test("rejects missing id", () => {
      const invalidTodo = {
        title: "Missing id",
        completed: false,
      };
      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    test("rejects missing title", () => {
      const invalidTodo = {
        id: "todo-123",
        completed: false,
      };
      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    test("rejects missing completed", () => {
      const invalidTodo = {
        id: "todo-123",
        title: "Missing completed field",
      };
      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    test("accepts empty id", () => {
      const validTodo = {
        id: "",
        title: "Empty id is valid",
        completed: false,
      };
      expect(() => TodoSchema.parse(validTodo)).not.toThrow(); // string schema allows empty string
    });

    test("accepts empty title", () => {
      const validTodo = {
        id: "todo-123",
        title: "",
        completed: false,
      };
      expect(() => TodoSchema.parse(validTodo)).not.toThrow(); // string schema allows empty string
    });

    test("rejects non-string id", () => {
      const invalidTodo = {
        id: 123,
        title: "Numeric id",
        completed: false,
      };
      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    test("rejects non-string title", () => {
      const invalidTodo = {
        id: "todo-123",
        title: 123,
        completed: false,
      };
      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    test("rejects non-boolean completed", () => {
      const invalidTodo = {
        id: "todo-123",
        title: "Non-boolean completed",
        completed: "false",
      };
      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    test("ignores extra properties", () => {
      const todoWithExtra = {
        id: "todo-123",
        title: "Valid todo",
        completed: false,
        extraProperty: "should be ignored",
      };
      const result = TodoSchema.parse(todoWithExtra);
      expect(result).toEqual({
        id: "todo-123",
        title: "Valid todo",
        completed: false,
      });
      expect("extraProperty" in result).toBe(false);
    });
  });
});
