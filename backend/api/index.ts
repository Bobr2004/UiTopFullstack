import "dotenv/config";

import { app } from "../src/app.js";
import { initDatabase } from "../src/db/init.js";

const ready = initDatabase();

export default async function handler(
  req: import("express").Request,
  res: import("express").Response,
) {
  await ready;
  app(req, res);
}
