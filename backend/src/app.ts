import cors from "cors";
import express from "express";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { todosRouter } from "./modules/todos/todos.routes.js";

const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

export const app = express();

app.use(
  cors({
    origin: frontendOrigin,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/categories", categoriesRouter);
app.use("/todos", todosRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
