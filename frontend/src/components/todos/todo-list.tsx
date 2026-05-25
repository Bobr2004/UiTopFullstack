"use client";

import { EmptyState } from "@/components/ui";
import type { Todo } from "@/types/todo";
import { TodoRow } from "./todo-row";

export function TodoList({
  todos,
  hiddenTodoIds,
  pendingRemovalIds,
  onComplete,
  onDelete,
}: {
  todos: Todo[];
  hiddenTodoIds: Set<number>;
  pendingRemovalIds: Set<number>;
  onComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  const visibleTodos = todos.filter((todo) => !hiddenTodoIds.has(todo.id));

  if (visibleTodos.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid gap-4">
      {visibleTodos.map((todo) => (
        <TodoRow
          key={todo.id}
          todo={todo}
          isPendingRemoval={pendingRemovalIds.has(todo.id)}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
