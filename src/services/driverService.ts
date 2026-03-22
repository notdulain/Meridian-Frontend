import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { DriverItem } from "@/src/services/types";

export const driverService = {
  available: async (): Promise<DriverItem[]> => {
    const { data } = await api.get<unknown>("/driver/api/drivers/available");
    return asArray<DriverItem>(data);
  },
};
