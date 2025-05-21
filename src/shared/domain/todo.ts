import { z } from "zod";

/** Todo */
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  reminderDateTime: z.date().nullable(),
});

export type Todo = z.infer<typeof TodoSchema>;

/** CreateTodo */
export const CreateTodoSchema = TodoSchema.omit({ id: true, completed: true }).extend({
  title: z.string().trim().min(1, { message: "Title is required" }), // Added .trim() here
  reminderDateTime: z.date().nullable().optional(),
});

export type CreateTodo = z.infer<typeof CreateTodoSchema>;

/** UpdateTodo */
export const UpdateTodoSchema = TodoSchema.pick({
  title: true,
  completed: true,
  reminderDateTime: true,
})
  .partial()
  .extend({
    title: z.string().trim().min(1, { message: "Title can't be empty if provided" }).optional(), // Added .trim() here
  });

export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
