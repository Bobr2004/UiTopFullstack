import type { RequestHandler } from "express";

import {
  createTodoSchema,
  listTodosQuerySchema,
  todoIdParamsSchema,
  updateTodoSchema,
} from "./todos.validation.js";
import * as todosService from "./todos.service.js";

export const listTodos: RequestHandler = async (req, res) => {
  const query = listTodosQuerySchema.parse(req.query);
  const todos = await todosService.listTodos(query.category);

  res.json({ data: todos });
};

export const createTodo: RequestHandler = async (req, res) => {
  const body = createTodoSchema.parse(req.body);
  const todo = await todosService.createTodo(body);

  res.status(201).json({ data: todo });
};

export const updateTodo: RequestHandler = async (req, res) => {
  const params = todoIdParamsSchema.parse(req.params);
  const body = updateTodoSchema.parse(req.body);
  const todo = await todosService.updateTodo(params.id, body);

  res.json({ data: todo });
};

export const deleteTodo: RequestHandler = async (req, res) => {
  const params = todoIdParamsSchema.parse(req.params);

  await todosService.deleteTodo(params.id);
  res.status(204).send();
};
