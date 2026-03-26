export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type EndpointMethod = HttpMethod | "WS";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  statusCode?: number;
  errors?: Record<string, string[] | string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: ApiErrorResponse;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
}
