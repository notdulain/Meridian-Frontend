import { API } from "@/src/api/definitions";
import type { RouteOptionDto, RoutePlanningResultDto, RouteQuery, SelectRoutePayloadDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): RouteOptionDto[] {
  if (Array.isArray(value)) return value as RouteOptionDto[];

  const record = asRecord(value);
  if (Array.isArray(record.routes)) return record.routes as RouteOptionDto[];
  if (Array.isArray(record.data)) return record.data as RouteOptionDto[];
  if (Array.isArray(record.items)) return record.items as RouteOptionDto[];

  return [];
}

function normalizeRoute(route: RouteOptionDto, index: number): RouteOptionDto {
  const routeId = route.routeId ?? route.id ?? `route-${index + 1}`;
  const distanceKm = typeof route.distanceKm === "number"
    ? route.distanceKm
    : typeof route.distanceValue === "number"
      ? Math.round((route.distanceValue / 1000) * 100) / 100
      : undefined;
  const durationMinutes = typeof route.durationMinutes === "number"
    ? route.durationMinutes
    : typeof route.durationValue === "number"
      ? Math.round(route.durationValue / 60)
      : undefined;
  const fuelCostLkr = typeof route.fuelCostLkr === "number"
    ? route.fuelCostLkr
    : typeof route.estimatedFuelCostLkr === "number"
      ? route.estimatedFuelCostLkr
      : typeof route.fuelCost === "number"
        ? route.fuelCost
        : undefined;

  return {
    ...route,
    id: String(routeId),
    routeId: String(routeId),
    summary: route.summary ?? `Route ${index + 1}`,
    distanceKm,
    durationMinutes,
    fuelCostLkr,
    estimatedFuelCostLkr: fuelCostLkr,
    polyline: route.polyline ?? route.polylinePoints,
    polylinePoints: route.polylinePoints ?? route.polyline,
  };
}

function normalizeRoutes(value: unknown): RouteOptionDto[] {
  return asArray(value).map(normalizeRoute);
}

export const routeService = {
  optimize: (payload: Record<string, unknown>) =>
    apiRequest<RouteOptionDto[], Record<string, unknown>>(API.routes.optimize, { data: payload }),
  calculate: async (origin: string, destination: string) => {
    const response = await apiRequest<unknown>(API.routes.calculate, { query: { origin, destination } });
    return normalizeRoute(asRecord(response) as RouteOptionDto, 0);
  },
  alternatives: async (origin: string, destination: string) => {
    const response = await apiRequest<unknown>(API.routes.alternatives, { query: { origin, destination } });
    return normalizeRoutes(response);
  },
  select: async (payload: SelectRoutePayloadDto) => {
    const response = await apiRequest<unknown, SelectRoutePayloadDto>(API.routes.select, { data: payload });
    const record = asRecord(response);
    return normalizeRoute((record.route ?? response) as RouteOptionDto, 0);
  },
  history: async (origin: string, destination: string) => {
    const response = await apiRequest<unknown>(API.routes.history, { query: { origin, destination } });
    return normalizeRoutes(response);
  },
  compare: async (origin: string, destination: string): Promise<RoutePlanningResultDto> => {
    const response = asRecord(await apiRequest<unknown>(API.routes.compare, { query: { origin, destination } }));
    return {
      historyRoutes: normalizeRoutes(response.historyRoutes),
      suggestedRoutes: normalizeRoutes(response.suggestedRoutes),
      comparison: normalizeRoutes(response.comparison),
    };
  },
  rank: async (origin: string, destination: string) => {
    const response = await apiRequest<unknown>(API.routes.rank, { query: { origin, destination } });
    return normalizeRoutes(response);
  },
  getRouteHistory: async (query: RouteQuery) => {
    const response = await apiRequest<unknown>(API.routes.history, { query });
    return normalizeRoutes(response);
  },
};
