import "dotenv/config";

import { app } from "./app.js";
import { initDatabase } from "./db/init.js";

const port = Number(process.env.PORT ?? 4000);

initDatabase();

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
