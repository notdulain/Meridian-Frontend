export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "items" in value) {
    const items = (value as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  if (value && typeof value === "object" && "data" in value) {
    const data = (value as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  if (value && typeof value === "object" && "routes" in value) {
    const routes = (value as { routes?: unknown }).routes;
    if (Array.isArray(routes)) return routes as T[];
  }
  return [];
}
