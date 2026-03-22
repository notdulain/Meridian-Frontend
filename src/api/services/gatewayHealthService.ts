import { API } from "@/src/api/definitions";
import type { HealthDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const gatewayHealthService = {
  root: () => apiRequest<HealthDto>(API.gatewayHealth.root),
  diagnostics: () => apiRequest<HealthDto>(API.gatewayHealth.diagnostics),
};
