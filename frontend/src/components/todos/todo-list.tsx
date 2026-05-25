"use client";

import { EmptyState } from "@/components/ui";
import type { Todo } from "@/types/todo";
import { TodoRow } from "./todo-row";

export function TodoList({
  todos,
  hiddenTodoIds,
  pendingRemovalIds,
  selectedTodoIds,
  onToggleSelected,
  onComplete,
  onDelete,
}: {
  todos: Todo[];
  hiddenTodoIds: Set<number>;
  pendingRemovalIds: Set<number>;
  selectedTodoIds: Set<number>;
  onToggleSelected: (todoId: number) => void;
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
          isSelected={selectedTodoIds.has(todo.id)}
          isPendingRemoval={pendingRemovalIds.has(todo.id)}
          onToggleSelected={onToggleSelected}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
