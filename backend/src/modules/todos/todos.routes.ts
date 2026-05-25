import { Router } from "express";

import { asyncHandler } from "../../utils/async-handler.js";
import * as todosController from "./todos.controller.js";

export const todosRouter = Router();

todosRouter.get("/", asyncHandler(todosController.listTodos));
todosRouter.post("/", asyncHandler(todosController.createTodo));
todosRouter.patch("/:id", asyncHandler(todosController.updateTodo));
todosRouter.delete("/:id", asyncHandler(todosController.deleteTodo));
