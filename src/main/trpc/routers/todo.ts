import type { Todo } from "#shared/domain/todo.js";
import { z } from "zod";
import { TodoRepo } from "../../repository/todo-repository.js";
import { publicProcedure, router } from "../core.js";

/**
 * Todo関連のルーター
 */
export const todoRouter = router({
  /** Return the full list of todos */
  list: publicProcedure.query(async () => {
    return await TodoRepo.findAll();
  }),

  /** Add a new todo item and return the updated list */
  add: publicProcedure
    .input(z.object({ title: z.string().min(1, "title required") }))
    .mutation(async ({ input }) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title: input.title,
        completed: false,
      };
      return await TodoRepo.add(newTodo);
    }),

  /** Toggle completion flag and return the updated list */
  toggle: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await TodoRepo.toggle(input.id);
    }),

  /** Remove a todo item and return the updated list */
  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await TodoRepo.remove(input.id);
    }),
});
