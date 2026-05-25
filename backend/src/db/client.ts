import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import "dotenv/config";

import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/todos.sqlite";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url: databaseUrl, authToken });

export const db = drizzle(client, { schema });
export const rawDb = client;
