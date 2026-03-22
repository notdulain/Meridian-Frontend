import { API } from "@/src/api/definitions";
import type { TrackingLocationDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";
import { createTrackingHubConnection, type TrackingHubConnection } from "@/src/api/utils/trackingHub";

export const trackingService = {
  postLocation: (payload: TrackingLocationDto) =>
    apiRequest<void, TrackingLocationDto>(API.tracking.postLocation, { data: payload }),
  assignmentHistory: (assignmentId: string) =>
    apiRequest<TrackingLocationDto[]>(API.tracking.assignmentHistory, { params: { assignmentId } }),
  driverLastKnown: (driverId: string) =>
    apiRequest<TrackingLocationDto | null>(API.tracking.driverLastKnown, { params: { driverId } }),
  connectHub: (): Promise<TrackingHubConnection> => createTrackingHubConnection(API.tracking.hub),
};
