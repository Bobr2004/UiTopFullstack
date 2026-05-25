import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type DbClientModule = typeof import("../src/db/client.js");
type TodosServiceModule = typeof import("../src/modules/todos/todos.service.js");
type CategoriesServiceModule = typeof import("../src/modules/categories/categories.service.js");

let rawDb: DbClientModule["rawDb"];
let createTodo: TodosServiceModule["createTodo"];
let listTodos: TodosServiceModule["listTodos"];
let listCategories: CategoriesServiceModule["listCategories"];

beforeAll(async () => {
  process.env.DATABASE_URL = ":memory:";
  vi.resetModules();

  const [dbClientModule, initDbModule, todosServiceModule, categoriesServiceModule] = await Promise.all([
    import("../src/db/client.js"),
    import("../src/db/init.js"),
    import("../src/modules/todos/todos.service.js"),
    import("../src/modules/categories/categories.service.js"),
  ]);

  rawDb = dbClientModule.rawDb;
  createTodo = todosServiceModule.createTodo;
  listTodos = todosServiceModule.listTodos;
  listCategories = categoriesServiceModule.listCategories;
  initDbModule.initDatabase();
});

beforeEach(() => {
  rawDb.exec(`
    DELETE FROM todos;
    DELETE FROM sqlite_sequence WHERE name = 'todos';
  `);
});

describe("todos API", () => {
  it("creates a todo and filters it by category", async () => {
    const categories = await listCategories();
    const personalCategory = categories.find((category) => category.slug === "personal");

    expect(personalCategory).toBeDefined();

    const todo = await createTodo({
      text: "Write tests",
      categoryId: personalCategory!.id,
    });

    expect(todo).toMatchObject({
      text: "Write tests",
      completed: false,
      category: {
        id: personalCategory!.id,
        slug: "personal",
      },
    });

    const filteredTodos = await listTodos("personal");

    expect(filteredTodos).toHaveLength(1);
    expect(filteredTodos[0]).toMatchObject({
      text: "Write tests",
      category: {
        slug: "personal",
      },
    });
  });

  it("rejects the sixth task in the same category", async () => {
    const categories = await listCategories();
    const workCategory = categories.find((category) => category.slug === "work");

    expect(workCategory).toBeDefined();

    for (let index = 1; index <= 5; index += 1) {
      const todo = await createTodo({
        text: `Work task ${index}`,
        categoryId: workCategory!.id,
      });

      expect(todo.text).toBe(`Work task ${index}`);
    }

    await expect(
      createTodo({
        text: "Work task 6",
        categoryId: workCategory!.id,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Category can contain at most 5 tasks",
    });
  });
});
