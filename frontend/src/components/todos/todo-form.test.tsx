import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TodoForm } from "./todo-form";

const categories = [
  {
    id: 1,
    name: "Work",
    slug: "work",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("TodoForm", () => {
  it("validates required fields before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TodoForm
        categories={categories}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Task text is required")).toBeInTheDocument();
    expect(screen.getByText("Category is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values with the selected category", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TodoForm
        categories={categories}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Task text" }), "  Write tests  ");
    await user.click(screen.getByRole("combobox", { name: "Category" }));
    await user.click(await screen.findByRole("option", { name: "Work" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        text: "Write tests",
        categoryId: 1,
      });
    });

    expect(screen.getByRole("textbox", { name: "Task text" })).toHaveValue("");
  });
});
