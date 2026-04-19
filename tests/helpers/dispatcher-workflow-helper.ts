import type { Page } from "@playwright/test";
import { createMockToken, getCredentialsForRole } from "./auth-helper";

const DASHBOARD_SUMMARY_BASE = {
  totalDeliveries: 42,
  activeDeliveries: 9,
  completedDeliveries: 31,
  overdueDeliveries: 2,
  availableVehicles: 7,
  vehiclesOnTrip: 5,
  availableDrivers: 4,
  activeAssignments: 6,
  pendingDeliveries: 12,
};

const DELIVERIES = [
  {
    id: "DEL-1001",
    orderNumber: "Order #1001",
    pickupAddress: "Warehouse A",
    deliveryAddress: "Main Hub",
    destination: "Main Hub",
    status: "Ready",
  },
  {
    id: "DEL-1002",
    orderNumber: "Order #1002",
    pickupAddress: "Warehouse B",
    deliveryAddress: "City Depot",
    destination: "City Depot",
    status: "Queued",
  },
];

const VEHICLE_RECOMMENDATIONS = [
  {
    id: "VEH-21",
    licensePlate: "CAB-2211",
    type: "Van",
    status: "Available",
    score: 92,
    reason: "Best route fit",
  },
  {
    id: "VEH-34",
    licensePlate: "CAB-3344",
    type: "Truck",
    status: "Available",
    score: 88,
    reason: "Higher payload capacity",
  },
];

const AVAILABLE_DRIVERS = [
  {
    id: "DRV-7",
    fullName: "S. Perera",
    status: "Active",
    availability: "Available",
  },
  {
    id: "DRV-9",
    fullName: "A. Silva",
    status: "Active",
    availability: "Available",
  },
];

const ROUTE_ALTERNATIVES = [
  {
    id: "ROUTE-1",
    summary: "Express route via A1",
    distanceKm: 12.4,
    durationMinutes: 28,
    estimatedFuelCostLkr: 1850,
  },
  {
    id: "ROUTE-2",
    summary: "Scenic route via B1",
    distanceKm: 15.8,
    durationMinutes: 36,
    estimatedFuelCostLkr: 2040,
  },
];

const ROUTE_HISTORY = [
  {
    id: "ROUTE-H1",
    summary: "Historical route via expressway",
    distanceKm: 13.1,
    durationMinutes: 31,
    estimatedFuelCostLkr: 1910,
  },
];

const TRACKING_ASSIGNMENTS = [
  {
    assignmentId: 9001,
    deliveryId: 1001,
    driverId: 7,
    vehicleId: 21,
    status: "Active",
  },
];

function jsonResponse(body: unknown) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

export async function mockDispatcherWorkflowApis(page: Page, referenceTime: Date = new Date()): Promise<void> {
  const referenceIso = referenceTime.toISOString();
  const trackingHistory = [
    {
      locationUpdateId: 1,
      assignmentId: 9001,
      driverId: 7,
      latitude: 6.9271,
      longitude: 79.8612,
      timestamp: referenceIso,
      speedKmh: 32,
    },
  ];

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname, searchParams } = url;
    const method = request.method();

    if (method === "POST" && pathname === "/api/auth/login") {
      const body = request.postDataJSON() as { email?: string; password?: string };
      const dispatcherCredentials = getCredentialsForRole("Dispatcher");

      if (body.email === dispatcherCredentials.email && body.password === dispatcherCredentials.password) {
        await route.fulfill(jsonResponse({
          accessToken: createMockToken("Dispatcher", dispatcherCredentials.email),
          refreshToken: "dispatcher-refresh-token",
        }));
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid email or password." }),
      });
      return;
    }

    if (!pathname.includes("/api/")) {
      await route.continue();
      return;
    }

    if (method === "GET" && pathname === "/api/dashboard/summary") {
      await route.fulfill(jsonResponse({
        ...DASHBOARD_SUMMARY_BASE,
        generatedAtUtc: referenceIso,
      }));
      return;
    }

    if (method === "GET" && pathname === "/delivery/api/deliveries") {
      await route.fulfill(jsonResponse(DELIVERIES));
      return;
    }

    if (method === "GET" && /^\/delivery\/api\/deliveries\/[^/]+\/recommend-vehicles$/.test(pathname)) {
      await route.fulfill(jsonResponse(VEHICLE_RECOMMENDATIONS));
      return;
    }

    if (method === "GET" && pathname === "/driver/api/drivers/available") {
      await route.fulfill(jsonResponse(AVAILABLE_DRIVERS));
      return;
    }

    if (method === "GET" && pathname === "/route/api/routes/alternatives") {
      await route.fulfill(jsonResponse(ROUTE_ALTERNATIVES));
      return;
    }

    if (method === "GET" && pathname === "/route/api/routes/history") {
      await route.fulfill(jsonResponse(ROUTE_HISTORY));
      return;
    }

    if (method === "GET" && pathname === "/assignment/api/assignments") {
      if (searchParams.get("pageSize") === "100") {
        await route.fulfill(jsonResponse({ success: true, data: TRACKING_ASSIGNMENTS }));
        return;
      }

      await route.fulfill(jsonResponse({
        success: true,
        data: [
          {
            id: "9001",
            deliveryId: "DEL-1001",
            vehicleId: "VEH-21",
            driverId: "DRV-7",
            assignedAt: referenceIso,
            assignedBy: "Dispatcher One",
            status: "Active",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          pageSize: 100,
        },
      }));
      return;
    }

    if (method === "POST" && pathname === "/assignment/api/assignments") {
      await route.fulfill(jsonResponse({
        success: true,
        message: "Assignment created successfully.",
      }));
      return;
    }

    if (method === "GET" && /^\/tracking\/api\/tracking\/assignment\/\d+\/history$/.test(pathname)) {
      await route.fulfill(jsonResponse(trackingHistory));
      return;
    }

    if (method === "GET" && /^\/tracking\/api\/tracking\/driver\/\d+\/last-known$/.test(pathname)) {
      await route.fulfill(jsonResponse(trackingHistory[trackingHistory.length - 1] ?? null));
      return;
    }

    await route.continue();
  });
}
