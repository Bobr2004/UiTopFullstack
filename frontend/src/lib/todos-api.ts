import type { ApiResponse } from "@/types/api";
import type { Category, Todo } from "@/types/todo";
import { api } from "./api";

export type CreateTodoInput = {
  text: string;
  categoryId: number;
};

export type UpdateTodoInput = {
  completed: boolean;
};

export async function getCategories() {
  const response = await api.get<ApiResponse<Category[]>>("/categories");
  return response.data.data;
}

export async function getTodos(category?: string) {
  const response = await api.get<ApiResponse<Todo[]>>("/todos", {
    params: category ? { category } : undefined,
  });
  return response.data.data;
}

export async function createTodo(input: CreateTodoInput) {
  const response = await api.post<ApiResponse<Todo>>("/todos", input);
  return response.data.data;
}

export async function updateTodo(id: number, input: UpdateTodoInput) {
  const response = await api.patch<ApiResponse<Todo>>(`/todos/${id}`, input);
  return response.data.data;
}

export async function deleteTodo(id: number) {
  await api.delete(`/todos/${id}`);
}
