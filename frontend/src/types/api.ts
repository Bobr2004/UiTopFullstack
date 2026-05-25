export type ApiResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  message: string;
  issues?: Record<string, string[] | undefined>;
};
