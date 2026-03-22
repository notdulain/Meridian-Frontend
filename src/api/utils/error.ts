import type { AxiosError } from "axios";
import type { ApiError, ApiErrorResponse } from "@/src/api/types/common";

export function normalizeApiError(error: unknown): ApiError {
  const fallback: ApiError = { message: "Something went wrong while calling the API." };

  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (!axiosError || typeof axiosError !== "object") return fallback;

  const status = axiosError.response?.status;
  const data = axiosError.response?.data;
  const message = data?.message || data?.error || data?.detail || axiosError.message || fallback.message;

  return {
    message,
    status,
    details: data,
  };
}
