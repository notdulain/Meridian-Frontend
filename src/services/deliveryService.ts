import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { DeliveryItem, VehicleItem } from "@/src/services/types";

export const deliveryService = {
  list: async (): Promise<DeliveryItem[]> => {
    const { data } = await api.get<unknown>("/delivery/api/deliveries");
    return asArray<DeliveryItem>(data);
  },
  recommendVehicles: async (id: string): Promise<VehicleItem[]> => {
    const { data } = await api.get<unknown>(`/delivery/api/deliveries/${id}/recommend-vehicles`);
    const arr = asArray<any>(data);
    return arr.map(v => ({
      ...v,
      id: v.id || v.vehicleId || String(v.licensePlate || Math.random())
    })) as VehicleItem[];
  },
};
