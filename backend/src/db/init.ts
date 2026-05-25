import { rawDb } from "./client.js";

const seedCategories = [
  { name: "Work", slug: "work" },
  { name: "Study", slug: "study" },
  { name: "Personal", slug: "personal" },
  { name: "Home", slug: "home" },
  { name: "Other", slug: "other" },
];

export function initDatabase() {
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS categories_slug_idx
      ON categories (slug);

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS todos_category_id_idx
      ON todos (category_id);
  `);

  const insertCategory = rawDb.prepare(`
    INSERT OR IGNORE INTO categories (name, slug, created_at)
    VALUES (@name, @slug, @createdAt)
  `);

  const createdAt = new Date().toISOString();
  const transaction = rawDb.transaction(() => {
    for (const category of seedCategories) {
      insertCategory.run({ ...category, createdAt });
    }
  });

  transaction();
}
