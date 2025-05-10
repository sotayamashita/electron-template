import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { ThemeRepo } from "../main/repository/theme-repository.js";
import { TodoRepo } from "../main/repository/todo-repository.js";

const t = initTRPC.create();
export const publicProcedure = t.procedure;

export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;
export const DefaultTheme: Theme = "system";

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});
export type Todo = z.infer<typeof TodoSchema>;

export const appRouter = t.router({
  ping: publicProcedure.query(() => {
    console.log("[main] pong");
    return "pong";
  }),
  task: t.router({
    list: publicProcedure.query(async () => {
      return await TodoRepo.findAll();
    }),
    add: publicProcedure
      .input(z.object({ title: z.string().min(1, "title required") }))
      .mutation(async ({ input }) => {
        const newTodo: Todo = {
          id: crypto.randomUUID(),
          title: input.title,
          completed: false,
        };
        return await TodoRepo.add(newTodo); // returns updated list
      }),
    toggle: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await TodoRepo.toggle(input.id); // updated list
      }),
    remove: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await TodoRepo.remove(input.id); // updated list
      }),
  }),
  theme: t.router({
    get: publicProcedure.query(async () => {
      return await ThemeRepo.get();
    }),
    set: publicProcedure
      .input(z.enum(["light", "dark", "system"]))
      .mutation(async ({ input }) => {
        return await ThemeRepo.set(input);
      }),
  }),
});
export type AppRouter = typeof appRouter;
