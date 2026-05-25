"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Spinner, ToastContainer, type ToastItem } from "@/components/ui";
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
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

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

  function addToast(toast: Omit<ToastItem, "id">, id = crypto.randomUUID()) {
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }

  function removeToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function clearTimer(todoId: number) {
    const timer = timersRef.current.get(todoId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(todoId);
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

  async function handleCompleteTodo(todo: Todo) {
    if (pendingRemovalIds.has(todo.id)) {
      return;
    }

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

    const timer = setTimeout(() => {
      void finalizeDelete(todo.id, toastId, false);
    }, UNDO_TIMEOUT_MS);

    timersRef.current.set(todo.id, timer);
  }

  async function undoComplete(todo: Todo, toastId: string) {
    clearTimer(todo.id);
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

    const timer = setTimeout(() => {
      void finalizeDelete(todo.id, toastId, true);
    }, UNDO_TIMEOUT_MS);

    timersRef.current.set(todo.id, timer);
  }

  function undoDelete(todoId: number, toastId: string) {
    clearTimer(todoId);
    removeToast(toastId);
    setHiddenTodoIds((current) => removeFromSet(current, todoId));
  }

  async function finalizeDelete(todoId: number, toastId: string, wasHidden: boolean) {
    clearTimer(todoId);
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

            {todosQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner label="Loading tasks" />
              </div>
            ) : (
              <TodoList
                hiddenTodoIds={hiddenTodoIds}
                pendingRemovalIds={pendingRemovalIds}
                todos={todos}
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

function getPageError(...errors: unknown[]) {
  const error = errors.find(Boolean);
  return error ? getApiErrorMessage(error) : undefined;
}
