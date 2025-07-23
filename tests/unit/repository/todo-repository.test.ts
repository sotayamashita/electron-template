import { NotFoundError } from "#shared/errors.js";
import type { TypedStore } from "@main/persistence/store.js";
import { TodoRepository } from "@main/repository/todo-repository.js";
import {
  beforeEach,
  describe,
  expect,
  test,
  type MockedFunction,
} from "vitest";
import { createTodo } from "../../factories/todo.factory.js";
import { createMockStore } from "../../mocks/store.mock.js";

type MockedStore = {
  [K in keyof TypedStore]: MockedFunction<TypedStore[K]>;
};

describe("TodoRepository", () => {
  let repository: TodoRepository;
  let mockStore: MockedStore;

  beforeEach(() => {
    mockStore = createMockStore();
    repository = new TodoRepository(mockStore);
  });

  describe("findAll", () => {
    test("returns all todos from store", async () => {
      const mockTodos = [createTodo(), createTodo()];
      mockStore.get.mockResolvedValue(mockTodos);

      const result = await repository.findAll();

      expect(mockStore.get).toHaveBeenCalledWith("todos");
      expect(result).toEqual(mockTodos);
    });

    test("returns empty array when no todos", async () => {
      mockStore.get.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    test("handles store errors gracefully", async () => {
      mockStore.get.mockRejectedValue(new Error("Store error"));

      await expect(repository.findAll()).rejects.toThrow("Store error");
    });
  });

  describe("findById", () => {
    test("returns todo when found", async () => {
      const targetTodo = createTodo({ id: "test-id" });
      const otherTodo = createTodo({ id: "other-id" });
      mockStore.get.mockResolvedValue([targetTodo, otherTodo]);

      const result = await repository.findById("test-id");

      expect(result).toEqual(targetTodo);
    });

    test("returns undefined when not found", async () => {
      const mockTodos = [createTodo({ id: "other-id" })];
      mockStore.get.mockResolvedValue(mockTodos);

      const result = await repository.findById("nonexistent");

      expect(result).toBeUndefined();
    });

    test("returns undefined when todos array is empty", async () => {
      mockStore.get.mockResolvedValue([]);

      const result = await repository.findById("any-id");

      expect(result).toBeUndefined();
    });

    test("handles store errors", async () => {
      mockStore.get.mockRejectedValue(new Error("Store error"));

      await expect(repository.findById("test-id")).rejects.toThrow(
        "Store error",
      );
    });
  });

  describe("getById", () => {
    test("returns todo when found", async () => {
      const targetTodo = createTodo({ id: "test-id" });
      mockStore.get.mockResolvedValue([targetTodo]);

      const result = await repository.getById("test-id");

      expect(result).toEqual(targetTodo);
    });

    test("throws NotFoundError when todo not found", async () => {
      mockStore.get.mockResolvedValue([]);

      await expect(repository.getById("nonexistent")).rejects.toThrow(
        NotFoundError,
      );

      try {
        await repository.getById("nonexistent");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).message).toContain("Todo");
        expect((error as NotFoundError).message).toContain("nonexistent");
      }
    });
  });

  describe("add", () => {
    test("adds new todo to store", async () => {
      const existingTodos = [createTodo({ id: "existing-1" })];
      const newTodo = createTodo({ id: "new-id" });
      mockStore.get.mockResolvedValue(existingTodos);

      const result = await repository.add(newTodo);

      expect(result).toEqual([...existingTodos, newTodo]);
      expect(mockStore.set).toHaveBeenCalledWith("todos", [
        ...existingTodos,
        newTodo,
      ]);
    });

    test("adds todo to empty store", async () => {
      const newTodo = createTodo({ id: "first-todo" });
      mockStore.get.mockResolvedValue([]);

      const result = await repository.add(newTodo);

      expect(result).toEqual([newTodo]);
      expect(mockStore.set).toHaveBeenCalledWith("todos", [newTodo]);
    });

    test("preserves existing todos when adding new one", async () => {
      const existingTodo1 = createTodo({ id: "id-1" });
      const existingTodo2 = createTodo({ id: "id-2" });
      const newTodo = createTodo({ id: "id-3" });
      mockStore.get.mockResolvedValue([existingTodo1, existingTodo2]);

      const result = await repository.add(newTodo);

      expect(result).toEqual([existingTodo1, existingTodo2, newTodo]);
    });

    test("handles store errors during get", async () => {
      mockStore.get.mockRejectedValue(new Error("Get error"));
      const newTodo = createTodo();

      await expect(repository.add(newTodo)).rejects.toThrow("Get error");
    });

    test("handles store errors during set", async () => {
      mockStore.get.mockResolvedValue([]);
      mockStore.set.mockRejectedValue(new Error("Set error"));
      const newTodo = createTodo();

      await expect(repository.add(newTodo)).rejects.toThrow("Set error");
    });
  });

  describe("remove", () => {
    test("removes todo from store and returns updated list", async () => {
      const todoToDelete = createTodo({ id: "delete-id" });
      const otherTodo = createTodo({ id: "keep-id" });
      mockStore.get.mockResolvedValue([todoToDelete, otherTodo]);

      const result = await repository.remove("delete-id");

      expect(result).toEqual([otherTodo]);
      expect(mockStore.set).toHaveBeenCalledWith("todos", [otherTodo]);
    });

    test("throws NotFoundError when todo not found", async () => {
      const existingTodo = createTodo({ id: "existing-id" });
      mockStore.get.mockResolvedValue([existingTodo]);

      await expect(repository.remove("nonexistent-id")).rejects.toThrow(
        NotFoundError,
      );

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    test("throws NotFoundError when todos array is empty", async () => {
      mockStore.get.mockResolvedValue([]);

      await expect(repository.remove("any-id")).rejects.toThrow(NotFoundError);

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    test("removes only the specific todo by ID", async () => {
      const todo1 = createTodo({ id: "id-1", title: "Same Title" });
      const todo2 = createTodo({ id: "id-2", title: "Same Title" });
      const todo3 = createTodo({ id: "id-3", title: "Different Title" });
      mockStore.get.mockResolvedValue([todo1, todo2, todo3]);

      const result = await repository.remove("id-1");

      expect(result).toEqual([todo2, todo3]);
      expect(mockStore.set).toHaveBeenCalledWith("todos", [todo2, todo3]);
    });

    test("handles store errors during get", async () => {
      mockStore.get.mockRejectedValue(new Error("Get error"));

      await expect(repository.remove("any-id")).rejects.toThrow("Get error");
    });

    test("handles store errors during set", async () => {
      const todo = createTodo({ id: "test-id" });
      mockStore.get.mockResolvedValue([todo]);
      mockStore.set.mockRejectedValue(new Error("Set error"));

      await expect(repository.remove("test-id")).rejects.toThrow("Set error");
    });
  });

  describe("toggle", () => {
    test("toggles todo completion status from false to true", async () => {
      const todo = createTodo({ id: "toggle-id", completed: false });
      const otherTodo = createTodo({ id: "other-id", completed: true });
      mockStore.get.mockResolvedValue([todo, otherTodo]);

      const result = await repository.toggle("toggle-id");

      const expectedTodo = { ...todo, completed: true };
      expect(result).toEqual([expectedTodo, otherTodo]);
      expect(mockStore.set).toHaveBeenCalledWith("todos", [
        expectedTodo,
        otherTodo,
      ]);
    });

    test("toggles todo completion status from true to false", async () => {
      const todo = createTodo({ id: "toggle-id", completed: true });
      mockStore.get.mockResolvedValue([todo]);

      const result = await repository.toggle("toggle-id");

      const expectedTodo = { ...todo, completed: false };
      expect(result).toEqual([expectedTodo]);
      expect(mockStore.set).toHaveBeenCalledWith("todos", [expectedTodo]);
    });

    test("throws NotFoundError when todo not found", async () => {
      const existingTodo = createTodo({ id: "existing-id" });
      mockStore.get.mockResolvedValue([existingTodo]);

      await expect(repository.toggle("nonexistent-id")).rejects.toThrow(
        NotFoundError,
      );

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    test("preserves other todos unchanged", async () => {
      const todo1 = createTodo({ id: "id-1", completed: false });
      const todo2 = createTodo({ id: "id-2", completed: true });
      const todo3 = createTodo({ id: "id-3", completed: false });
      mockStore.get.mockResolvedValue([todo1, todo2, todo3]);

      const result = await repository.toggle("id-2");

      const expectedTodo2 = { ...todo2, completed: false };
      expect(result).toEqual([todo1, expectedTodo2, todo3]);
    });

    test("handles store errors during get", async () => {
      mockStore.get.mockRejectedValue(new Error("Get error"));

      await expect(repository.toggle("any-id")).rejects.toThrow("Get error");
    });

    test("handles store errors during set", async () => {
      const todo = createTodo({ id: "test-id" });
      mockStore.get.mockResolvedValue([todo]);
      mockStore.set.mockRejectedValue(new Error("Set error"));

      await expect(repository.toggle("test-id")).rejects.toThrow("Set error");
    });
  });
});
