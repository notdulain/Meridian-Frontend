export interface VehicleRecommendation {
  vehicleId: string;
  plateNumber?: string;
  make?: string;
  model?: string;
  currentLocation?: string;
  distanceToPickupKm?: number;
  reason: string;
  score: number;
}

export interface LiveVehiclePosition {
  assignmentId: string;
  driverId: string;
  vehicleId: string;
  lat: number;
  lng: number;
  status: string;
  timestamp?: string;
}

export interface VehicleLocationEvent {
  vehicleId: string;
  latitude: number;
  longitude: number;
  status: string;
}

export interface LocationUpdateEvent {
  locationUpdateId: number;
  assignmentId: number;
  driverId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speedKmh?: number | null;
}

export interface TrackedAssignment {
  assignmentId: number;
  deliveryId: number;
  driverId: number;
  vehicleId: number;
  status?: string;
}
