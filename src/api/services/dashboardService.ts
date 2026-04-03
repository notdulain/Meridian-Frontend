import { API } from "@/src/api/definitions";
import type { DashboardSummaryDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const dashboardService = {
  summary: () => apiRequest<DashboardSummaryDto>(API.dashboard.summary),
};
