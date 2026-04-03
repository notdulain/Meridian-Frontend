import { API } from "@/src/api/definitions";
import type { DeliverySuccessReportDto, DeliverySuccessReportQuery } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const reportService = {
  deliverySuccess: (query?: DeliverySuccessReportQuery) =>
    apiRequest<DeliverySuccessReportDto>(API.reports.deliverySuccess, { query }),
};