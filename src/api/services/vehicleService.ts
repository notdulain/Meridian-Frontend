import { API } from "@/src/api/definitions";
import type { VehicleDto, VehicleListQuery } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const vehicleService = {
  create: (payload: Partial<VehicleDto>) => apiRequest<VehicleDto, Partial<VehicleDto>>(API.vehicles.create, { data: payload }),
  list: (query?: VehicleListQuery) => apiRequest<VehicleDto[]>(API.vehicles.list, { query }),
  byId: (id: string) => apiRequest<VehicleDto>(API.vehicles.byId, { params: { id } }),
  update: (id: string, payload: Partial<VehicleDto>) =>
    apiRequest<VehicleDto, Partial<VehicleDto>>(API.vehicles.update, { params: { id }, data: payload }),
  updateStatus: (id: string, payload: { status: string }) =>
    apiRequest<VehicleDto, { status: string }>(API.vehicles.updateStatus, { params: { id }, data: payload }),
  delete: (id: string) => apiRequest<void>(API.vehicles.delete, { params: { id } }),
  available: () => apiRequest<VehicleDto[]>(API.vehicles.available),
};
