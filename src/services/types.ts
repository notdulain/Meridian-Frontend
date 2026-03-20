export interface DeliveryItem {
  id: string;
  orderNumber?: string;
  destination?: string;
  status?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
}

export interface VehicleItem {
  id: string;
  licensePlate?: string;
  type?: string;
  status?: string;
  score?: number;
  reason?: string;
}

export interface DriverItem {
  id: string;
  fullName?: string;
  status?: string;
  availability?: string;
}

export interface RouteItem {
  id: string;
  distanceKm?: number;
  durationMinutes?: number;
  estimatedFuelCostLkr?: number;
  summary?: string;
}

export interface AssignmentPayload {
  deliveryId: string;
  vehicleId: string;
  driverId: string;
  routeId: string;
}
