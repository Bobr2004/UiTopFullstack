import type { RequestHandler } from "express";

import * as categoriesService from "./categories.service.js";

export const listCategories: RequestHandler = async (_req, res) => {
  const categories = await categoriesService.listCategories();

  res.json({ data: categories });
};
