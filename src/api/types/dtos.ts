import type { AuthRole } from "@/lib/types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  role: AuthRole;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface UserDto {
  id: string;
  fullName?: string;
  email: string;
  role?: AuthRole;
  isActive?: boolean;
}

export interface RoleDto {
  id: string;
  name: string;
}

export interface DeliveryDto {
  id: string;
  status?: string;
  destination?: string;
  orderNumber?: string;
  [key: string]: unknown;
}

export interface VehicleDto {
  id: string;
  status?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface DriverDto {
  id: string;
  fullName?: string;
  [key: string]: unknown;
}

export interface DriverPerformanceReportRowDto {
  driverId: number;
  deliveriesCompleted: number;
  averageDeliveryTimeMinutes: number;
  onTimeRatePercent: number;
}

export interface DeliverySuccessReportDto {
  deliveredCount: number;
  failedCount: number;
  cancelledCount: number;
  terminalCount: number;
  successRatePercentage: number;
}

export interface VehicleUtilizationReportRowDto {
  vehicleId: number;
  tripsCount: number;
  kilometersDriven: number;
  idleTimeMinutes: number;
}

export interface AssignmentDto {
  id: string;
  deliveryId?: string;
  driverId?: string;
  [key: string]: unknown;
}

export interface RouteOptionDto {
  id: string;
  origin?: string;
  destination?: string;
  [key: string]: unknown;
}

export interface TrackingLocationDto {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export interface DashboardSummaryDto {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  overdueDeliveries: number;
  availableVehicles: number;
  vehiclesOnTrip: number;
  availableDrivers: number;
  activeAssignments: number;
  generatedAtUtc: string;
}

export interface HealthDto {
  status?: string;
  [key: string]: unknown;
}

export interface DeliveryListQuery {
  status?: string;
  destination?: string;
  date?: string;
  orderNumber?: string;
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface VehicleListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  isActive?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

export interface DriverListQuery {
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface DriverPerformanceReportQuery {
  startDateUtc?: string;
  endDateUtc?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface DeliverySuccessReportQuery {
  startDateUtc?: string;
  endDateUtc?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface VehicleUtilizationReportQuery {
  startDateUtc?: string;
  endDateUtc?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AssignmentHistoryQuery {
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface RouteQuery {
  origin: string;
  destination: string;
  [key: string]: string | number | boolean | null | undefined;
}

export type TrendRange = "daily" | "weekly" | "monthly";

export interface DeliveryTrendPointDto {
  period: string;
  total: number;
  pending: number;
  assigned: number;
  inTransit: number;
  delivered: number;
  failed: number;
  canceled: number;
}

export interface DeliveryTrendQuery {
  range?: TrendRange;
  from?: string;
  to?: string;
  [key: string]: string | number | boolean | null | undefined;
}
