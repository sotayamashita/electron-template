import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
export const publicProcedure = t.procedure;

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});
export type Todo = z.infer<typeof TodoSchema>;

// In-memory store (per Main process instance)
const todos: Todo[] = [];

export const appRouter = t.router({
  ping: publicProcedure.query(() => {
    console.log("[main] pong");
    return "pong";
  }),
  task: t.router({
    list: publicProcedure.query(() => todos),
    add: publicProcedure
      .input(z.object({ title: z.string().min(1, "title required") }))
      .mutation(({ input }) => {
        const newTodo: Todo = {
          id: crypto.randomUUID(),
          title: input.title,
          completed: false,
        };
        todos.push(newTodo);
        return newTodo;
      }),
    toggle: publicProcedure
      .input(z.object({ id: z.string(), completed: z.boolean() }))
      .mutation(({ input }) => {
        const todo = todos.find((t) => t.id === input.id);
        if (!todo) {
          throw new Error("Todo not found");
        }
        todo.completed = input.completed;
        return todo;
      }),
    remove: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        const index = todos.findIndex((t) => t.id === input.id);
        if (index === -1) {
          throw new Error("Todo not found");
        }
        const [removed] = todos.splice(index, 1);
        return removed;
      }),
  }),
});
export type AppRouter = typeof appRouter;
