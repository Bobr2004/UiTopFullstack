import { AxiosError } from "axios";

import type { ApiErrorResponse } from "@/types/api";

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    return response?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
