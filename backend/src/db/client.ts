import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import "dotenv/config";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL ?? "./data/todos.sqlite";
const databaseDir = dirname(databaseUrl);

if (databaseUrl !== ":memory:" && databaseDir !== ".") {
  mkdirSync(databaseDir, { recursive: true });
}

const sqlite = new Database(databaseUrl);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export const rawDb = sqlite;
