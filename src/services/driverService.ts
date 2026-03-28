import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { DriverItem } from "@/src/services/types";

interface DriverPayload {
  id?: string | number;
  driverId?: string | number;
  fullName?: string;
  status?: string;
  availability?: string;
  isActive?: boolean;
  currentWorkingHoursToday?: number;
  maxWorkingHoursPerDay?: number;
}

export const driverService = {
  available: async (): Promise<DriverItem[]> => {
    const { data } = await api.get<unknown>("/driver/api/drivers/available");
    const arr = asArray<DriverPayload>(data);
    return arr.map((driver) => ({
      id: String(driver.id ?? driver.driverId),
      fullName: driver.fullName,
      status: driver.status ?? (driver.isActive ? "Active" : "Inactive"),
      availability:
        driver.availability ??
        ((driver.currentWorkingHoursToday ?? 0) < (driver.maxWorkingHoursPerDay ?? 0) ? "Available" : "Unavailable"),
    })) as DriverItem[];
  },
};
