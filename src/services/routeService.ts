import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { RouteItem } from "@/src/services/types";

function toNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toDistanceKm(route: Record<string, unknown>): number | undefined {
  const distanceKm = toNumber(route.distanceKm);
  if (distanceKm !== undefined) return distanceKm;

  const distanceValue = toNumber(route.distanceValue);
  if (distanceValue !== undefined) return Math.round((distanceValue / 1000) * 100) / 100;

  return undefined;
}

function toDurationMinutes(route: Record<string, unknown>): number | undefined {
  const durationMinutes = toNumber(route.durationMinutes);
  if (durationMinutes !== undefined) return durationMinutes;

  const durationValue = toNumber(route.durationValue);
  if (durationValue !== undefined) return Math.round(durationValue / 60);

  return undefined;
}

function mapRoute(route: Record<string, unknown>, index: number): RouteItem {
  const rawId = route.id ?? route.routeId ?? `route-${index + 1}`;

  return {
    id: String(rawId),
    summary: typeof route.summary === "string" ? route.summary : `Route #${index + 1}`,
    distanceKm: toDistanceKm(route),
    durationMinutes: toDurationMinutes(route),
    estimatedFuelCostLkr:
      toNumber(route.estimatedFuelCostLkr) ??
      toNumber(route.fuelCostLkr) ??
      toNumber(route.fuelCost),
  };
}

export const routeService = {
  alternatives: async (origin: string, destination: string): Promise<RouteItem[]> => {
    const { data } = await api.get<unknown>("/route/api/routes/alternatives", {
      params: { origin, destination },
    });
    return asArray<Record<string, unknown>>(data).map(mapRoute);
  },
  history: async (origin: string, destination: string): Promise<RouteItem[]> => {
    const { data } = await api.get<unknown>("/route/api/routes/history", {
      params: { origin, destination },
    });
    return asArray<Record<string, unknown>>(data).map(mapRoute);
  },
};
