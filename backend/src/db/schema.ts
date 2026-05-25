import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug),
  }),
);

export const todos = sqliteTable(
  "todos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    text: text("text").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    categoryIdx: index("todos_category_id_idx").on(table.categoryId),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  todos: many(todos),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  category: one(categories, {
    fields: [todos.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
