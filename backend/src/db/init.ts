import { rawDb } from "./client.js";

const seedCategories = [
  { name: "Work", slug: "work" },
  { name: "Study", slug: "study" },
  { name: "Personal", slug: "personal" },
  { name: "Home", slug: "home" },
  { name: "Other", slug: "other" },
];

export async function initDatabase() {
  await rawDb.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    )
  `);

  await rawDb.execute(`
    CREATE INDEX IF NOT EXISTS categories_slug_idx
      ON categories (slug)
  `);

  await rawDb.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )
  `);

  await rawDb.execute(`
    CREATE INDEX IF NOT EXISTS todos_category_id_idx
      ON todos (category_id)
  `);

  const createdAt = new Date().toISOString();

  for (const category of seedCategories) {
    await rawDb.execute({
      sql: "INSERT OR IGNORE INTO categories (name, slug, created_at) VALUES (?, ?, ?)",
      args: [category.name, category.slug, createdAt],
    });
  }
}
