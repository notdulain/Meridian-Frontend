import api from "@/services/api";

export interface LocationPayload {
  assignmentId: number;
  driverId: number;
  latitude: number;
  longitude: number;
  speedKmh?: number | null;
}

export const trackingService = {
  postLocation: async (payload: LocationPayload): Promise<void> => {
    await api.post("/tracking/api/tracking/location", payload);
  },
};
