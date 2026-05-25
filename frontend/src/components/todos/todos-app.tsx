"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Alert, Badge, Button, Checkbox, Spinner, ToastContainer, type ToastItem } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import { createTodo, deleteTodo, getCategories, getTodos, updateTodo } from "@/lib/todos-api";
import type { Todo } from "@/types/todo";
import { ALL_CATEGORIES, CategoryFilter } from "./category-filter";
import { TodoForm } from "./todo-form";
import { TodoList } from "./todo-list";

const UNDO_TIMEOUT_MS = 5_000;

export function TodosApp() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [hiddenTodoIds, setHiddenTodoIds] = useState<Set<number>>(new Set());
  const [pendingRemovalIds, setPendingRemovalIds] = useState<Set<number>>(new Set());
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<number>>(new Set());
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const activeCategory = selectedCategory === ALL_CATEGORIES ? undefined : selectedCategory;

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });

  const todosQuery = useQuery({
    queryKey: queryKeys.todos(activeCategory),
    queryFn: () => getTodos(activeCategory),
  });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      updateTodo(id, { completed }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
  });

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const todos = useMemo(() => todosQuery.data ?? [], [todosQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const pageError = getPageError(categoriesQuery.error, todosQuery.error);
  const visibleCount = useMemo(
    () => todos.filter((todo) => !hiddenTodoIds.has(todo.id)).length,
    [hiddenTodoIds, todos],
  );
  const visibleTodos = useMemo(
    () => todos.filter((todo) => !hiddenTodoIds.has(todo.id)),
    [hiddenTodoIds, todos],
  );
  const selectableTodoIds = useMemo(
    () =>
      visibleTodos
        .filter((todo) => !pendingRemovalIds.has(todo.id) && !todo.completed)
        .map((todo) => todo.id),
    [pendingRemovalIds, visibleTodos],
  );
  const selectedVisibleTodoIds = useMemo(
    () => selectableTodoIds.filter((todoId) => selectedTodoIds.has(todoId)),
    [selectableTodoIds, selectedTodoIds],
  );
  const allVisibleSelectableSelected =
    selectableTodoIds.length > 0 && selectedVisibleTodoIds.length === selectableTodoIds.length;

  function addToast(toast: Omit<ToastItem, "id">, id = crypto.randomUUID()) {
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }

  function removeToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function clearTimer(timerKey: string) {
    const timer = timersRef.current.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(timerKey);
    }
  }

  function updateTodoInCache(todoId: number, patch: Partial<Todo>) {
    queryClient.setQueriesData<Todo[]>({ queryKey: ["todos"] }, (current) => {
      if (!current) {
        return current;
      }

      return current.map((todo) => (todo.id === todoId ? { ...todo, ...patch } : todo));
    });
  }

  async function handleCreateTodo(input: { text: string; categoryId: number }) {
    await createMutation.mutateAsync(input);
  }

  function updateMultipleTodosInCache(todoIds: number[], patch: Partial<Todo>) {
    const todoIdSet = new Set(todoIds);
    queryClient.setQueriesData<Todo[]>({ queryKey: ["todos"] }, (current) => {
      if (!current) {
        return current;
      }

      return current.map((todo) => (todoIdSet.has(todo.id) ? { ...todo, ...patch } : todo));
    });
  }

  function handleToggleSelected(todoId: number) {
    setSelectedTodoIds((current) => toggleSetValue(current, todoId));
  }

  function handleToggleSelectAllVisible() {
    setSelectedTodoIds((current) => {
      const next = new Set(current);
      if (allVisibleSelectableSelected) {
        selectableTodoIds.forEach((todoId) => next.delete(todoId));
      } else {
        selectableTodoIds.forEach((todoId) => next.add(todoId));
      }
      return next;
    });
  }

  async function handleCompleteTodo(todo: Todo) {
    if (pendingRemovalIds.has(todo.id)) {
      return;
    }

    setSelectedTodoIds((current) => removeFromSet(current, todo.id));
    setPendingRemovalIds((current) => new Set(current).add(todo.id));
    updateTodoInCache(todo.id, { completed: true });

    try {
      await updateMutation.mutateAsync({ id: todo.id, completed: true });
    } catch (error) {
      setPendingRemovalIds((current) => removeFromSet(current, todo.id));
      updateTodoInCache(todo.id, { completed: false });
      addToast({
        title: "Could not complete task",
        description: getApiErrorMessage(error),
        variant: "danger",
      });
      return;
    }

    const toastId = crypto.randomUUID();
    addToast({
      title: "Task marked done",
      description: "It will disappear in 5 seconds.",
      variant: "success",
      action: (
        <Button size="sm" type="button" variant="outline" onClick={() => undoComplete(todo, toastId)}>
          Undo
        </Button>
      ),
    }, toastId);

    const timerKey = `complete:${todo.id}`;
    const timer = setTimeout(() => {
      void finalizeDelete(todo.id, toastId, false);
    }, UNDO_TIMEOUT_MS);

    timersRef.current.set(timerKey, timer);
  }

  async function undoComplete(todo: Todo, toastId: string) {
    clearTimer(`complete:${todo.id}`);
    removeToast(toastId);
    setPendingRemovalIds((current) => removeFromSet(current, todo.id));
    updateTodoInCache(todo.id, { completed: false });

    try {
      await updateMutation.mutateAsync({ id: todo.id, completed: false });
    } catch (error) {
      addToast({
        title: "Could not undo completion",
        description: getApiErrorMessage(error),
        variant: "danger",
      });
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  }

  function handleDeleteTodo(todo: Todo) {
    if (pendingRemovalIds.has(todo.id) || hiddenTodoIds.has(todo.id)) {
      return;
    }

    setSelectedTodoIds((current) => removeFromSet(current, todo.id));
    setHiddenTodoIds((current) => new Set(current).add(todo.id));

    const toastId = crypto.randomUUID();
    addToast({
      title: "Task deleted",
      description: "Undo is available for 5 seconds.",
      variant: "warning",
      action: (
        <Button size="sm" type="button" variant="outline" onClick={() => undoDelete(todo.id, toastId)}>
          Undo
        </Button>
      ),
    }, toastId);

    const timerKey = `delete:${todo.id}`;
    const timer = setTimeout(() => {
      void finalizeDelete(todo.id, toastId, true);
    }, UNDO_TIMEOUT_MS);

    timersRef.current.set(timerKey, timer);
  }

  function undoDelete(todoId: number, toastId: string) {
    clearTimer(`delete:${todoId}`);
    removeToast(toastId);
    setHiddenTodoIds((current) => removeFromSet(current, todoId));
  }

  async function handleBulkComplete() {
    if (selectedVisibleTodoIds.length === 0) {
      return;
    }

    const selectedIdSet = new Set(selectedVisibleTodoIds);
    const selectedTodos = todos.filter((todo) => selectedIdSet.has(todo.id));
    const todoIds = selectedTodos.map((todo) => todo.id);

    setSelectedTodoIds((current) => {
      const next = new Set(current);
      todoIds.forEach((todoId) => next.delete(todoId));
      return next;
    });
    setPendingRemovalIds((current) => addManyToSet(current, todoIds));
    updateMultipleTodosInCache(todoIds, { completed: true });

    const results = await Promise.allSettled(
      selectedTodos.map((todo) => updateTodo(todo.id, { completed: true })),
    );

    const failedTodoIds = todoIds.filter((_, index) => results[index]?.status === "rejected");
    const completedTodos = selectedTodos.filter((_, index) => results[index]?.status === "fulfilled");
    const completedTodoIds = completedTodos.map((todo) => todo.id);

    if (failedTodoIds.length > 0) {
      setPendingRemovalIds((current) => removeManyFromSet(current, failedTodoIds));
      updateMultipleTodosInCache(failedTodoIds, { completed: false });
      addToast({
        title: "Some tasks could not be completed",
        description: `${failedTodoIds.length} task${failedTodoIds.length === 1 ? "" : "s"} stayed unchanged.`,
        variant: "danger",
      });
    }

    if (completedTodoIds.length === 0) {
      return;
    }

    const toastId = crypto.randomUUID();
    addToast({
      title: `${completedTodoIds.length} task${completedTodoIds.length === 1 ? "" : "s"} marked done`,
      description: "They will disappear in 5 seconds.",
      variant: "success",
      action: (
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={() => undoBulkComplete(completedTodos, toastId)}
        >
          Undo
        </Button>
      ),
    }, toastId);

    const timerKey = `bulk:${toastId}`;
    const timer = setTimeout(() => {
      void finalizeBulkDelete(completedTodoIds, toastId);
    }, UNDO_TIMEOUT_MS);

    timersRef.current.set(timerKey, timer);
  }

  async function undoBulkComplete(todosToRestore: Todo[], toastId: string) {
    clearTimer(`bulk:${toastId}`);
    removeToast(toastId);

    const todoIds = todosToRestore.map((todo) => todo.id);
    setPendingRemovalIds((current) => removeManyFromSet(current, todoIds));
    updateMultipleTodosInCache(todoIds, { completed: false });

    const results = await Promise.allSettled(
      todosToRestore.map((todo) => updateTodo(todo.id, { completed: false })),
    );
    const failedTodoIds = todoIds.filter((_, index) => results[index]?.status === "rejected");

    if (failedTodoIds.length > 0) {
      addToast({
        title: "Could not undo all tasks",
        description: `${failedTodoIds.length} task${failedTodoIds.length === 1 ? "" : "s"} may need a refresh.`,
        variant: "danger",
      });
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  }

  async function finalizeDelete(todoId: number, toastId: string, wasHidden: boolean) {
    clearTimer(wasHidden ? `delete:${todoId}` : `complete:${todoId}`);
    removeToast(toastId);

    try {
      await deleteMutation.mutateAsync(todoId);
      setHiddenTodoIds((current) => removeFromSet(current, todoId));
      setPendingRemovalIds((current) => removeFromSet(current, todoId));
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch (error) {
      if (wasHidden) {
        setHiddenTodoIds((current) => removeFromSet(current, todoId));
      }
      setPendingRemovalIds((current) => removeFromSet(current, todoId));
      addToast({
        title: "Could not delete task",
        description: getApiErrorMessage(error),
        variant: "danger",
      });
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  }

  async function finalizeBulkDelete(todoIds: number[], toastId: string) {
    clearTimer(`bulk:${toastId}`);
    removeToast(toastId);

    const results = await Promise.allSettled(todoIds.map((todoId) => deleteTodo(todoId)));
    const failedTodoIds = todoIds.filter((_, index) => results[index]?.status === "rejected");

    setPendingRemovalIds((current) => removeManyFromSet(current, todoIds));

    if (failedTodoIds.length > 0) {
      addToast({
        title: "Could not remove all completed tasks",
        description: `${failedTodoIds.length} task${failedTodoIds.length === 1 ? "" : "s"} remained in the list.`,
        variant: "danger",
      });
    }

    void queryClient.invalidateQueries({ queryKey: ["todos"] });
  }

  return (
    <main className="min-h-screen bg-brutal-bg px-4 py-6 text-brutal-fg sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="border-3 border-brutal bg-brutal-accent p-5 shadow-brutal-lg sm:p-7">
          <p className="text-sm font-black uppercase tracking-wide">Deeloped by Shovkoplias Bohdan for UItop test assigment</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-normal sm:text-5xl">Task board</h1>
            </div>
            <div className="border-3 border-brutal bg-white px-4 py-3 font-black shadow-brutal">
              <span className="text-3xl">{visibleCount}</span>
              <span className="ml-2 uppercase">visible</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {categoriesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner label="Loading categories" />
            </div>
          ) : null}

          {pageError ? (
            <Alert>
              <p className="font-black">Something went wrong</p>
              <p className="mt-1 text-sm">{pageError}</p>
              <Button
                className="mt-3"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  void categoriesQuery.refetch();
                  void todosQuery.refetch();
                }}
              >
                <RefreshCw className="h-4 w-4 stroke-[3]" />
                Retry
              </Button>
            </Alert>
          ) : null}

          {!categoriesQuery.isLoading && !categoriesQuery.isError ? (
            <TodoForm
              categories={categories}
              errorMessage={createMutation.isError ? getApiErrorMessage(createMutation.error) : undefined}
              isSubmitting={createMutation.isPending}
              onSubmit={handleCreateTodo}
            />
          ) : null}

          <div className="grid gap-4 border-3 border-brutal bg-brutal-muted p-4 shadow-brutal-lg">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 stroke-[3]" />
                  <h2 className="text-2xl font-black">Todos</h2>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-700">
                  Completed tasks wait here for 5 seconds before deletion.
                </p>
              </div>
              <CategoryFilter
                categories={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            <div className="flex flex-col gap-3 border-3 border-brutal bg-white p-3 shadow-brutal sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 font-black uppercase">
                  <Checkbox
                    aria-label="Select all visible tasks"
                    checked={allVisibleSelectableSelected}
                    disabled={selectableTodoIds.length === 0}
                    onCheckedChange={handleToggleSelectAllVisible}
                  />
                  <span>Select visible</span>
                </label>
                <Badge variant={selectedVisibleTodoIds.length > 0 ? "accent" : "default"}>
                  {selectedVisibleTodoIds.length} selected
                </Badge>
              </div>

              <Button
                disabled={selectedVisibleTodoIds.length === 0}
                loading={false}
                type="button"
                variant="secondary"
                onClick={() => {
                  void handleBulkComplete();
                }}
              >
                <CheckCheck className="h-4 w-4 stroke-[3]" />
                Mark selected done
              </Button>
            </div>

            {todosQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner label="Loading tasks" />
              </div>
            ) : (
              <TodoList
                hiddenTodoIds={hiddenTodoIds}
                pendingRemovalIds={pendingRemovalIds}
                selectedTodoIds={selectedTodoIds}
                todos={todos}
                onToggleSelected={handleToggleSelected}
                onComplete={handleCompleteTodo}
                onDelete={handleDeleteTodo}
              />
            )}
          </div>
        </div>
      </section>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

function removeFromSet(set: Set<number>, value: number) {
  const next = new Set(set);
  next.delete(value);
  return next;
}

function removeManyFromSet(set: Set<number>, values: number[]) {
  const next = new Set(set);
  values.forEach((value) => next.delete(value));
  return next;
}

function addManyToSet(set: Set<number>, values: number[]) {
  const next = new Set(set);
  values.forEach((value) => next.add(value));
  return next;
}

function toggleSetValue(set: Set<number>, value: number) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function getPageError(...errors: unknown[]) {
  const error = errors.find(Boolean);
  return error ? getApiErrorMessage(error) : undefined;
}
