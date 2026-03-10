import api from "./api";
import type { RouteOptionDto } from "@/lib/types";

export const routeService = {
    getRankedRoutes: async (deliveryId: number): Promise<RouteOptionDto[]> => {
        // Calling backend simulation here
        // In actual implementation: await api.get(`/api/routes/rank?deliveryId=${deliveryId}`)
        const { data } = await api.get<RouteOptionDto[]>(`/api/routes/rank`, {
            params: { deliveryId }
        });
        return data;
    },
};
