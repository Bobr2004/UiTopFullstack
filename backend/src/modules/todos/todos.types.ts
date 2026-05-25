export type TodoDto = {
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
