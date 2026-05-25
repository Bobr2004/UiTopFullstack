import { z } from "zod";

export const listTodosQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
});

export const createTodoSchema = z.object({
  text: z.string().trim().min(1, "Task text is required").max(200),
  categoryId: z.coerce.number().int().positive(),
});

export const updateTodoSchema = z.object({
  completed: z.boolean(),
});

export const todoIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
