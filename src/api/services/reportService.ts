import { API } from "@/src/api/definitions";
import type { DeliverySuccessReportDto, DeliverySuccessReportQuery, FuelCostReportQuery, FuelCostReportRowDto } from "@/src/api/types/dtos";
import { apiDownload, apiRequest } from "@/src/api/utils/request";

export const reportService = {
  deliverySuccess: (query?: DeliverySuccessReportQuery) =>
    apiRequest<DeliverySuccessReportDto>(API.reports.deliverySuccess, { query }),
  deliverySuccessCsv: (query?: DeliverySuccessReportQuery) =>
    apiDownload(API.reports.deliverySuccessCsv, { query }),
  fuelCost: (query?: FuelCostReportQuery) =>
    apiRequest<FuelCostReportRowDto[]>(API.reports.fuelCost, { query }),
  fuelCostCsv: (query?: FuelCostReportQuery) =>
    apiDownload(API.reports.fuelCostCsv, { query }),
};
