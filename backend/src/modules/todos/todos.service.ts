import { count, desc, eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { categories, todos } from "../../db/schema.js";
import { HttpError } from "../../utils/http-error.js";
import type { TodoDto } from "./todos.types.js";

const MAX_TASKS_PER_CATEGORY = 5;

type TodoRow = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
};

function toTodoDto(row: TodoRow): TodoDto {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: {
      id: row.categoryId,
      name: row.categoryName,
      slug: row.categorySlug,
    },
  };
}

const todoSelection = {
  id: todos.id,
  text: todos.text,
  completed: todos.completed,
  createdAt: todos.createdAt,
  updatedAt: todos.updatedAt,
  categoryId: categories.id,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export async function listTodos(categorySlug?: string): Promise<TodoDto[]> {
  if (categorySlug) {
    const rows = await db
      .select(todoSelection)
      .from(todos)
      .innerJoin(categories, eq(todos.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug))
      .orderBy(desc(todos.createdAt))
      .all();

    return rows.map(toTodoDto);
  }

  const rows = await db
    .select(todoSelection)
    .from(todos)
    .innerJoin(categories, eq(todos.categoryId, categories.id))
    .orderBy(desc(todos.createdAt))
    .all();

  return rows.map(toTodoDto);
}

export async function createTodo(input: {
  text: string;
  categoryId: number;
}): Promise<TodoDto> {
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.id, input.categoryId))
    .get();

  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  const [{ value: tasksInCategory }] = await db
    .select({ value: count() })
    .from(todos)
    .where(eq(todos.categoryId, input.categoryId))
    .all();

  if (tasksInCategory >= MAX_TASKS_PER_CATEGORY) {
    throw new HttpError(400, "Category can contain at most 5 tasks");
  }

  const now = new Date().toISOString();
  const [created] = await db
    .insert(todos)
    .values({
      text: input.text,
      categoryId: input.categoryId,
      completed: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: todos.id })
    .all();

  return getTodoOrThrow(created.id);
}

export async function updateTodo(
  id: number,
  input: { completed: boolean },
): Promise<TodoDto> {
  await getTodoOrThrow(id);

  await db
    .update(todos)
    .set({
      completed: input.completed,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(todos.id, id))
    .run();

  return getTodoOrThrow(id);
}

export async function deleteTodo(id: number): Promise<void> {
  await getTodoOrThrow(id);
  await db.delete(todos).where(eq(todos.id, id)).run();
}

async function getTodoOrThrow(id: number): Promise<TodoDto> {
  const row = await db
    .select(todoSelection)
    .from(todos)
    .innerJoin(categories, eq(todos.categoryId, categories.id))
    .where(eq(todos.id, id))
    .get();

  if (!row) {
    throw new HttpError(404, "Todo not found");
  }

  return toTodoDto(row);
}
