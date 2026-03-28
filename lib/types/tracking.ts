export interface VehicleRecommendation {
  vehicleId: string;
  driverName: string;
  distanceKm: number;
  etaMinutes: number;
  fuelCost: number;
  reason: string;
  score: number;
}

export interface LiveVehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  status: string;
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

