import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { DeliveryItem, VehicleItem } from "@/src/services/types";

interface VehicleRecommendationPayload {
  id?: string | number;
  vehicleId?: string | number;
  plateNumber?: string;
  licensePlate?: string;
  make?: string;
  model?: string;
  type?: string;
  status?: string;
  score?: number;
  matchScore?: number;
  reason?: string;
  recommendationReason?: string;
}

export const deliveryService = {
  list: async (): Promise<DeliveryItem[]> => {
    const { data } = await api.get<unknown>("/delivery/api/deliveries");
    return asArray<DeliveryItem>(data);
  },
  recommendVehicles: async (id: string): Promise<VehicleItem[]> => {
    const { data } = await api.get<unknown>(`/delivery/api/deliveries/${id}/recommend-vehicles`);
    const arr = asArray<VehicleRecommendationPayload>(data);
    return arr.map((vehicle) => ({
      id: String(vehicle.id ?? vehicle.vehicleId ?? vehicle.plateNumber ?? Math.random()),
      licensePlate: vehicle.licensePlate ?? vehicle.plateNumber,
      type: vehicle.type ?? [vehicle.make, vehicle.model].filter(Boolean).join(" "),
      status: vehicle.status,
      score: vehicle.score ?? vehicle.matchScore,
      reason: vehicle.reason ?? vehicle.recommendationReason,
    })) as VehicleItem[];
  },
};
