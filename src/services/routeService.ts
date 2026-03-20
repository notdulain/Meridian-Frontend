import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { RouteItem } from "@/src/services/types";

export const routeService = {
  alternatives: async (origin: string, destination: string): Promise<RouteItem[]> => {
    const { data } = await api.get<unknown>("/route/api/routes/alternatives", {
      params: { origin, destination },
    });
    return asArray<RouteItem>(data);
  },
  history: async (origin: string, destination: string): Promise<RouteItem[]> => {
    const { data } = await api.get<unknown>("/route/api/routes/history", {
      params: { origin, destination },
    });
    return asArray<RouteItem>(data);
  },
};
