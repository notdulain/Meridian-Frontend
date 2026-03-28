import api from "@/services/api";
import { asArray } from "@/src/services/normalize";
import type { DriverItem } from "@/src/services/types";

interface DriverPayload {
  id?: string | number;
  driverId?: string | number;
  userId?: string;
  fullName?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: string;
  availability?: string;
  isActive?: boolean;
  currentWorkingHoursToday?: number;
  maxWorkingHoursPerDay?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverProfile {
  driverId: number;
  userId: string;
  fullName?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive?: boolean;
  currentWorkingHoursToday?: number;
  maxWorkingHoursPerDay?: number;
  createdAt?: string;
  updatedAt?: string;
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
  me: async (): Promise<DriverProfile | null> => {
    try {
      const { data } = await api.get<{ data?: DriverPayload }>("/driver/api/drivers/me");
      const driver = data?.data;
      if (!driver?.driverId) return null;

      return {
        driverId: Number(driver.driverId),
        userId: String(driver.userId ?? ""),
        fullName: driver.fullName,
        phoneNumber: driver.phoneNumber,
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry,
        isActive: driver.isActive,
        currentWorkingHoursToday: driver.currentWorkingHoursToday,
        maxWorkingHoursPerDay: driver.maxWorkingHoursPerDay,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      };
    } catch {
      return null;
    }
  },
};
