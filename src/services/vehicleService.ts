import { deliveryService } from "@/src/services/deliveryService";
import type { VehicleItem } from "@/src/services/types";

export const vehicleService = {
  recommendByDelivery: async (deliveryId: string): Promise<VehicleItem[]> => {
    return deliveryService.recommendVehicles(deliveryId);
  },
};
