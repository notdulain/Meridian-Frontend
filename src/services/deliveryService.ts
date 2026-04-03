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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = asArray<any>(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return arr.map((v: any) => ({
      ...v,
      id: v.id || v.vehicleId || String(v.licensePlate || Math.random())
    })) as VehicleItem[];
  },
};
