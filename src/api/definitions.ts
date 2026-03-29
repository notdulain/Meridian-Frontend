export const API = {
  auth: {
    register: "POST /api/auth/register",
    login: "POST /api/auth/login",
    refresh: "POST /api/auth/refresh",
    revoke: "POST /api/auth/revoke",
    logout: "POST /api/auth/logout",
  },

  users: {
    list: "GET /api/users",
    byId: "GET /api/users/:id",
    me: "GET /api/users/me",
    update: "PUT /api/users/:id",
    delete: "DELETE /api/users/:id",
  },

  roles: {
    list: "GET /api/roles",
    me: "GET /api/roles/me",
  },

  deliveries: {
    list: "GET /delivery/api/deliveries?status&destination&date&orderNumber&page&pageSize",
    create: "POST /delivery/api/deliveries",
    byId: "GET /delivery/api/deliveries/:id",
    update: "PUT /delivery/api/deliveries/:id",
    delete: "DELETE /delivery/api/deliveries/:id",
    recommendVehicles: "GET /delivery/api/deliveries/:id/recommend-vehicles",
  },

  vehicles: {
    create: "POST /vehicle/api/vehicles",
    list: "GET /vehicle/api/vehicles?page&pageSize&status&isActive",
    byId: "GET /vehicle/api/vehicles/:id",
    update: "PUT /vehicle/api/vehicles/:id",
    updateStatus: "PUT /vehicle/api/vehicles/:id/status",
    delete: "DELETE /vehicle/api/vehicles/:id",
    available: "GET /vehicle/api/vehicles/available",
  },

  drivers: {
    create: "POST /driver/api/drivers",
    list: "GET /driver/api/drivers?page&pageSize",
    deleted: "GET /driver/api/drivers/deleted?page&pageSize",
    byId: "GET /driver/api/drivers/:id",
    me: "GET /driver/api/drivers/me",
    update: "PUT /driver/api/drivers/:id",
    updateHours: "PUT /driver/api/drivers/:id/hours",
    delete: "DELETE /driver/api/drivers/:id",
    available: "GET /driver/api/drivers/available",
  },

  reports: {
    driverPerformance: "GET /driver/api/reports/driver-performance?startDateUtc&endDateUtc",
  },

  assignments: {
    create: "POST /assignment/api/assignments",
    list: "GET /assignment/api/assignments?page&pageSize",
    byId: "GET /assignment/api/assignments/:id",
    history: "GET /assignment/api/assignments/history?fromDate&toDate&page&pageSize",
    byDelivery: "GET /assignment/api/assignments/delivery/:deliveryId",
    activeByDriver: "GET /assignment/api/assignments/driver/:driverId/active",
    complete: "PUT /assignment/api/assignments/:id/complete",
    cancel: "PUT /assignment/api/assignments/:id/cancel",
  },

  routes: {
    optimize: "POST /route/api/routes/optimize",
    calculate: "GET /route/api/routes/calculate?origin&destination",
    alternatives: "GET /route/api/routes/alternatives?origin&destination",
    select: "POST /route/api/routes/select",
    history: "GET /route/api/routes/history?origin&destination",
    compare: "GET /route/api/routes/compare?origin&destination",
    rank: "GET /route/api/routes/rank?origin&destination",
  },

  tracking: {
    postLocation: "POST /tracking/api/tracking/location",
    assignmentHistory: "GET /tracking/api/tracking/assignment/:assignmentId/history",
    driverLastKnown: "GET /tracking/api/tracking/driver/:driverId/last-known",
    hub: "WS /hubs/tracking",
  },

  dashboard: {
    summary: "GET /api/dashboard/summary",
  },

  gatewayHealth: {
    root: "GET /",
    diagnostics: "GET /diagnostics",
  },
} as const;

export type ApiDefinition = typeof API;
