/**
 * Meridian shared TypeScript types
 * Mirror the DTOs from each backend service.
 */

// ─── Delivery ────────────────────────────────────────────────────
export type DeliveryStatus =
    | "Pending"
    | "Assigned"
    | "InTransit"
    | "Delivered"
    | "Failed"
    | "Canceled";

export interface StatusHistory {
    id: number;
    deliveryId: number;
    previousStatus: DeliveryStatus;
    newStatus: DeliveryStatus;
    changedAt: string;
    changedBy: string;
    notes?: string;
}

export interface DeliveryDto {
    id: number;
    pickupAddress: string;
    deliveryAddress: string;
    packageWeightKg: number;
    packageVolumeM3: number;
    deadline: string;
    status: DeliveryStatus;
    assignedVehicleId: number | null;
    assignedDriverId: number | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    statusHistory: StatusHistory[];
}

export interface CreateDeliveryRequest {
    pickupAddress: string;
    deliveryAddress: string;
    packageWeightKg: number;
    packageVolumeM3: number;
    deadline: string;
    createdBy: string;
}

// ─── Vehicle ─────────────────────────────────────────────────────
export type VehicleType = "Motorcycle" | "Van" | "Truck" | "LargeTruck";
export type VehicleStatus = "Available" | "InUse" | "Maintenance" | "OutOfService";

export interface VehicleDto {
    id: number;
    licensePlate: string;
    type: VehicleType;
    capacityWeightKg: number;
    capacityVolumeM3: number;
    fuelEfficiencyKmPerL: number;
    status: VehicleStatus;
    createdAt: string;
}

// ─── Driver ──────────────────────────────────────────────────────
export type DriverStatus = "Available" | "OnDuty" | "OffDuty" | "OnLeave";

export interface DriverDto {
    id: number;
    fullName: string;
    phoneNumber: string;
    licenseNumber: string;
    maxWorkingHoursPerDay: number;
    status: DriverStatus;
    createdAt: string;
}

// ─── Assignment ───────────────────────────────────────────────────
export interface AssignmentDto {
    id: number;
    deliveryId: number;
    vehicleId: number;
    driverId: number;
    assignedAt: string;
    assignedBy: string;
}

export interface AssignmentRecommendation {
    vehicleId: number;
    licensePlate: string;
    driverId: number;
    driverName: string;
    score: number;
    reason: string;
}

// ─── Route ───────────────────────────────────────────────────────
export interface RouteOptionDto {
    id: number;
    deliveryId: number;
    distanceKm: number;
    durationMinutes: number;
    estimatedFuelCostLkr: number;
    isSelected: boolean;
    summary: string;
}

// ─── Tracking ────────────────────────────────────────────────────
export interface LocationUpdate {
    driverId: number;
    latitude: number;
    longitude: number;
    timestamp: string;
}

// ─── Auth ─────────────────────────────────────────────────────────
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    role?: string;
}
