import { API } from "@/src/api/definitions";
import type { RouteOptionDto, RouteQuery } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const routeService = {
  optimize: (payload: Record<string, unknown>) =>
    apiRequest<RouteOptionDto[], Record<string, unknown>>(API.routes.optimize, { data: payload }),
  calculate: (origin: string, destination: string) =>
    apiRequest<RouteOptionDto>(API.routes.calculate, { query: { origin, destination } }),
  alternatives: (origin: string, destination: string) =>
    apiRequest<RouteOptionDto[]>(API.routes.alternatives, { query: { origin, destination } }),
  select: (payload: { routeId: string; deliveryId?: string }) =>
    apiRequest<RouteOptionDto, { routeId: string; deliveryId?: string }>(API.routes.select, { data: payload }),
  history: (origin: string, destination: string) =>
    apiRequest<RouteOptionDto[]>(API.routes.history, { query: { origin, destination } }),
  compare: (origin: string, destination: string) =>
    apiRequest<RouteOptionDto[]>(API.routes.compare, { query: { origin, destination } }),
  rank: (origin: string, destination: string) =>
    apiRequest<RouteOptionDto[]>(API.routes.rank, { query: { origin, destination } }),
  getRouteHistory: (query: RouteQuery) => apiRequest<RouteOptionDto[]>(API.routes.history, { query }),
};
