import { API } from "@/src/api/definitions";
import type { TrackingLocationDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

/** Payload sent by the driver on each GPS ping. */
export type LocationPayload = Omit<TrackingLocationDto, "locationUpdateId" | "timestamp">;

export const trackingService = {
  /** Driver: POST a live GPS position to the tracking service. */
  postLocation: (payload: LocationPayload) =>
    apiRequest<void, LocationPayload>(API.tracking.postLocation, { data: payload }),

  /** Dispatcher: fetch the full location history for an assignment. */
  assignmentHistory: (assignmentId: string) =>
    apiRequest<TrackingLocationDto[]>(API.tracking.assignmentHistory, {
      params: { assignmentId },
    }),

  /** Dispatcher: fetch the most recent known position of a driver. */
  driverLastKnown: (driverId: string) =>
    apiRequest<TrackingLocationDto | null>(API.tracking.driverLastKnown, {
      params: { driverId },
    }),
};
