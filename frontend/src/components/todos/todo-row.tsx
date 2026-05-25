"use client";

import { Trash2 } from "lucide-react";

import { Badge, Button, Checkbox } from "@/components/ui";
import type { Todo } from "@/types/todo";

export function TodoRow({
  todo,
  isSelected,
  isPendingRemoval,
  onToggleSelected,
  onComplete,
  onDelete,
}: {
  todo: Todo;
  isSelected: boolean;
  isPendingRemoval: boolean;
  onToggleSelected: (todoId: number) => void;
  onComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  return (
    <li
      className={[
        "grid gap-4 border-3 border-brutal bg-white p-4 shadow-brutal transition-all sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]",
        isPendingRemoval ? "translate-x-1 translate-y-1 opacity-55 shadow-none" : "",
        isSelected ? "bg-brutal-accent/35" : "",
      ].join(" ")}
    >
      <Checkbox
        aria-label={`Select ${todo.text}`}
        checked={isSelected}
        disabled={isPendingRemoval || todo.completed}
        onCheckedChange={() => onToggleSelected(todo.id)}
      />

      <div className="min-w-0">
        <p className={todo.completed ? "break-words font-black line-through" : "break-words font-black"}>
          {todo.text}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="accent">{todo.category.name}</Badge>
          <Badge variant={todo.completed ? "success" : "warning"}>
            {todo.completed ? "done" : "not done"}
          </Badge>
          {isPendingRemoval ? <Badge variant="danger">pending removal</Badge> : null}
          {isSelected ? <Badge>selected</Badge> : null}
        </div>
      </div>

      <Checkbox
        aria-label={`Mark ${todo.text} completed`}
        checked={todo.completed}
        disabled={isPendingRemoval || todo.completed}
        onCheckedChange={(checked) => {
          if (checked === true) {
            onComplete(todo);
          }
        }}
      />

      <Button
        aria-label={`Delete ${todo.text}`}
        className="self-start"
        disabled={isPendingRemoval}
        size="icon"
        type="button"
        variant="danger"
        onClick={() => onDelete(todo)}
      >
        <Trash2 className="h-4 w-4 stroke-[3]" />
      </Button>
    </li>
  );
}
