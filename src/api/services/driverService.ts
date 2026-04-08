import { API } from "@/src/api/definitions";
import type { DriverDto, DriverListQuery, DriverPerformanceReportQuery, DriverPerformanceReportRowDto, DriverProfileDto } from "@/src/api/types/dtos";
import { apiDownload, apiRequest } from "@/src/api/utils/request";

export const driverService = {
  create: (payload: Partial<DriverDto>) => apiRequest<DriverDto, Partial<DriverDto>>(API.drivers.create, { data: payload }),
  list: (query?: DriverListQuery) => apiRequest<DriverDto[]>(API.drivers.list, { query }),
  deleted: (query?: DriverListQuery) => apiRequest<DriverDto[]>(API.drivers.deleted, { query }),
  byId: (id: string) => apiRequest<DriverDto>(API.drivers.byId, { params: { id } }),
  me: () => apiRequest<DriverProfileDto>(API.drivers.me),
  update: (id: string, payload: Partial<DriverDto>) =>
    apiRequest<DriverDto, Partial<DriverDto>>(API.drivers.update, { params: { id }, data: payload }),
  updateHours: (id: string, payload: { maxWorkingHoursPerDay: number }) =>
    apiRequest<DriverDto, { maxWorkingHoursPerDay: number }>(API.drivers.updateHours, { params: { id }, data: payload }),
  delete: (id: string) => apiRequest<void>(API.drivers.delete, { params: { id } }),
  available: () => apiRequest<DriverDto[]>(API.drivers.available),
  performanceReport: (query?: DriverPerformanceReportQuery) =>
    apiRequest<DriverPerformanceReportRowDto[]>(API.reports.driverPerformance, { query }),
  performanceReportCsv: (query?: DriverPerformanceReportQuery) =>
    apiDownload(API.reports.driverPerformanceCsv, { query }),
};
