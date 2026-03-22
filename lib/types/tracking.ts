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

