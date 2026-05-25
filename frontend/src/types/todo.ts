export type Category = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
};

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
};
