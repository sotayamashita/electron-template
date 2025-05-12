import { z } from "zod";
import { todoService } from "../../services/index.js";
import { publicProcedure, router } from "../core.js";

/**
 * Todo related router
 * Handles API endpoints for todo operations
 */
export const todoRouter = router({
  /** Return the full list of todos */
  list: publicProcedure.query(async () => {
    return todoService.getAll();
  }),

  /** Add a new todo item and return the updated list */
  add: publicProcedure
    .input(z.object({ title: z.string().min(1, "title required") }))
    .mutation(async ({ input }) => {
      return todoService.createTodo(input.title);
    }),

  /** Toggle completion flag and return the updated list */
  toggle: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return todoService.toggleTodo(input.id);
    }),

  /** Remove a todo item and return the updated list */
  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return todoService.removeTodo(input.id);
    }),
});
