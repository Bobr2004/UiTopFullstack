export const queryKeys = {
  categories: ["categories"] as const,
  todos: (category?: string) => ["todos", { category: category ?? "all" }] as const,
};
