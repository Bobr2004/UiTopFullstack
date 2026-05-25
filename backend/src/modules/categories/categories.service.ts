import { asc } from "drizzle-orm";

import { db } from "../../db/client.js";
import { categories } from "../../db/schema.js";

export async function listCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .orderBy(asc(categories.name))
    .all();
}
