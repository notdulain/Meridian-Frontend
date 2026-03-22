import { API } from "@/src/api/definitions";
import type { AssignmentDto, AssignmentHistoryQuery } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const assignmentService = {
  create: (payload: Partial<AssignmentDto>) =>
    apiRequest<AssignmentDto, Partial<AssignmentDto>>(API.assignments.create, { data: payload }),
  list: (query?: { page?: number; pageSize?: number }) => apiRequest<AssignmentDto[]>(API.assignments.list, { query }),
  byId: (id: string) => apiRequest<AssignmentDto>(API.assignments.byId, { params: { id } }),
  history: (query?: AssignmentHistoryQuery) => apiRequest<AssignmentDto[]>(API.assignments.history, { query }),
  byDelivery: (deliveryId: string) =>
    apiRequest<AssignmentDto[]>(API.assignments.byDelivery, { params: { deliveryId } }),
  activeByDriver: (driverId: string) =>
    apiRequest<AssignmentDto | null>(API.assignments.activeByDriver, { params: { driverId } }),
  complete: (id: string) => apiRequest<AssignmentDto>(API.assignments.complete, { params: { id } }),
  cancel: (id: string) => apiRequest<AssignmentDto>(API.assignments.cancel, { params: { id } }),
};
