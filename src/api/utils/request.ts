import apiClient from "@/src/api/client";
import type { HttpMethod } from "@/src/api/types/common";
import { buildUrl, parseEndpoint, type PathParams, type QueryParams } from "@/src/api/utils/endpoint";
import { normalizeApiError } from "@/src/api/utils/error";

interface RequestArgs<TBody> {
  params?: PathParams;
  query?: QueryParams;
  data?: TBody;
}

export async function apiRequest<TResponse, TBody = unknown>(
  endpointDefinition: string,
  args: RequestArgs<TBody> = {},
): Promise<TResponse> {
  const parsed = parseEndpoint(endpointDefinition);
  if (parsed.method === "WS") {
    throw new Error(`Cannot call WS endpoint over HTTP: ${endpointDefinition}`);
  }

  const query =
    parsed.queryKeys.length > 0 && args.query
      ? Object.fromEntries(Object.entries(args.query).filter(([key]) => parsed.queryKeys.includes(key)))
      : args.query;

  const url = buildUrl(parsed.path, args.params, query);

  try {
    const { data } = await apiClient.request<TResponse>({
      method: parsed.method as HttpMethod,
      url,
      data: args.data,
    });
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
