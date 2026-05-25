import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TodosApp } from "./todos-app";
import {
  createTodo,
  deleteTodo,
  getCategories,
  getTodos,
  updateTodo,
} from "@/lib/todos-api";

vi.mock("@/lib/todos-api", () => ({
  getCategories: vi.fn(),
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

const mockedGetCategories = vi.mocked(getCategories);
const mockedGetTodos = vi.mocked(getTodos);
const mockedCreateTodo = vi.mocked(createTodo);
const mockedUpdateTodo = vi.mocked(updateTodo);
const mockedDeleteTodo = vi.mocked(deleteTodo);

const categories = [
  {
    id: 1,
    name: "Work",
    slug: "work",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const todos = [
  {
    id: 101,
    text: "Bulk task alpha",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    category: {
      id: 1,
      name: "Work",
      slug: "work",
    },
  },
  {
    id: 102,
    text: "Bulk task beta",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    category: {
      id: 1,
      name: "Work",
      slug: "work",
    },
  },
];

function renderTodosApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TodosApp />
    </QueryClientProvider>,
  );
}

describe("TodosApp", () => {
  beforeEach(() => {
    mockedGetCategories.mockResolvedValue(categories);
    mockedGetTodos.mockResolvedValue(todos);
    mockedCreateTodo.mockResolvedValue(todos[0]);
    mockedUpdateTodo.mockImplementation(async (id, input) => {
      const todo = todos.find((entry) => entry.id === id);
      if (!todo) {
        throw new Error("Todo not found");
      }

      return {
        ...todo,
        completed: input.completed,
      };
    });
    mockedDeleteTodo.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("bulk-completes the selected tasks and allows undo", async () => {
    const user = userEvent.setup();

    renderTodosApp();

    expect(await screen.findByText("Bulk task alpha")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Select Bulk task alpha" }));
    await user.click(screen.getByRole("checkbox", { name: "Select Bulk task beta" }));
    await user.click(screen.getByRole("button", { name: "Mark selected done" }));

    await waitFor(() => {
      expect(mockedUpdateTodo).toHaveBeenCalledWith(101, { completed: true });
      expect(mockedUpdateTodo).toHaveBeenCalledWith(102, { completed: true });
    });

    expect(await screen.findByText("2 tasks marked done")).toBeInTheDocument();
    expect(screen.getByText("0 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => {
      expect(mockedUpdateTodo).toHaveBeenCalledWith(101, { completed: false });
      expect(mockedUpdateTodo).toHaveBeenCalledWith(102, { completed: false });
    });

    expect(screen.getByRole("checkbox", { name: "Mark Bulk task alpha completed" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Mark Bulk task beta completed" })).not.toBeChecked();
    expect(mockedDeleteTodo).not.toHaveBeenCalled();
  });
});
