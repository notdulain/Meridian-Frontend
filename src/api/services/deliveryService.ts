import { API } from "@/src/api/definitions";
import type { DeliveryDto, DeliveryListQuery, VehicleDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const deliveryService = {
  list: (query?: DeliveryListQuery) => apiRequest<DeliveryDto[]>(API.deliveries.list, { query }),
  create: (payload: Partial<DeliveryDto>) => apiRequest<DeliveryDto, Partial<DeliveryDto>>(API.deliveries.create, { data: payload }),
  byId: (id: string) => apiRequest<DeliveryDto>(API.deliveries.byId, { params: { id } }),
  update: (id: string, payload: Partial<DeliveryDto>) =>
    apiRequest<DeliveryDto, Partial<DeliveryDto>>(API.deliveries.update, { params: { id }, data: payload }),
  delete: (id: string) => apiRequest<void>(API.deliveries.delete, { params: { id } }),
  recommendVehicles: (id: string) => apiRequest<VehicleDto[]>(API.deliveries.recommendVehicles, { params: { id } }),
};
