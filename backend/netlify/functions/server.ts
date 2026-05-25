import serverless from "serverless-http";

import { app } from "../../src/app.js";
import { initDatabase } from "../../src/db/init.js";

const ready = initDatabase();
const serverlessHandler = serverless(app);

export const handler = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>,
) => {
  await ready;
  return await serverlessHandler(event, context);
};
