import type { EndpointMethod } from "@/src/api/types/common";

export interface ParsedEndpoint {
  method: EndpointMethod;
  path: string;
  queryKeys: string[];
}

export type PathParams = Record<string, string | number | boolean>;
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export function parseEndpoint(definition: string): ParsedEndpoint {
  const [method, ...rest] = definition.trim().split(" ");
  const [path, query] = rest.join(" ").split("?");

  if (!method || !path) {
    throw new Error(`Invalid API definition: ${definition}`);
  }

  return {
    method: method.toUpperCase() as EndpointMethod,
    path,
    queryKeys: query ? query.split("&").filter(Boolean) : [],
  };
}

export function buildPath(pathTemplate: string, params?: PathParams): string {
  if (!params) return pathTemplate;

  return pathTemplate.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
}

export function buildQueryString(query?: QueryParams): string {
  if (!query) return "";

  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });

  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function buildUrl(pathTemplate: string, params?: PathParams, query?: QueryParams): string {
  return `${buildPath(pathTemplate, params)}${buildQueryString(query)}`;
}
