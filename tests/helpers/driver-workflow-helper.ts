import type { Page } from "@playwright/test";
import { createMockToken, getCredentialsForRole } from "./auth-helper";

const DRIVER_PROFILE = {
  driverId: 7,
  userId: "7",
  fullName: "R. Perera",
  phoneNumber: "+94 77 123 4567",
  licenseNumber: "B1234567",
  licenseExpiry: "2027-12-31T00:00:00.000Z",
  isActive: true,
  currentWorkingHoursToday: 3,
  maxWorkingHoursPerDay: 8,
  createdAt: "2026-04-19T00:00:00.000Z",
  updatedAt: "2026-04-19T00:00:00.000Z",
};

const ACTIVE_ASSIGNMENT = {
  assignmentId: 9001,
  deliveryId: 1001,
  vehicleId: 21,
};

const GEO_POSITION = {
  latitude: 6.9271,
  longitude: 79.8612,
  speedKmh: 36,
};

function jsonResponse(body: unknown) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

export async function authenticateAsDriver(page: Page): Promise<void> {
  const credentials = getCredentialsForRole("Driver");
  const token = createMockToken("Driver", credentials.email, DRIVER_PROFILE.driverId);

  await page.addInitScript(
    ({ tokenValue, roleValue, userValue }) => {
      localStorage.setItem("meridian_token", tokenValue);
      localStorage.setItem("meridian_role", roleValue);
      localStorage.setItem("meridian_user", JSON.stringify(userValue));
    },
    {
      tokenValue: token,
      roleValue: "Driver",
      userValue: {
        id: DRIVER_PROFILE.driverId,
        email: credentials.email,
        name: DRIVER_PROFILE.fullName,
      },
    },
  );
}

export async function mockDriverDashboardApis(page: Page, withActiveAssignment: boolean): Promise<void> {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    const method = request.method();

    if (!pathname.includes("/api/")) {
      await route.continue();
      return;
    }

    if (method === "GET" && pathname === "/driver/api/drivers/me") {
      await route.fulfill(jsonResponse({ data: DRIVER_PROFILE }));
      return;
    }

    if (method === "GET" && pathname === `/assignment/api/assignments/driver/${DRIVER_PROFILE.driverId}/active`) {
      await route.fulfill(jsonResponse({
        data: withActiveAssignment ? ACTIVE_ASSIGNMENT : null,
      }));
      return;
    }

    if (method === "POST" && pathname === "/tracking/api/tracking/location") {
      await route.fulfill(jsonResponse({ success: true }));
      return;
    }

    await route.continue();
  });
}

export async function mockDriverGeolocation(page: Page): Promise<void> {
  await page.addInitScript(
    ({ latitude, longitude, speedKmh }) => {
      const successPosition = {
        coords: {
          latitude,
          longitude,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: speedKmh / 3.6,
      },
        timestamp: Date.now(),
      };

      const geolocation = {
        watchPosition(success: PositionCallback, _error?: PositionErrorCallback, _options?: PositionOptions) {
          queueMicrotask(() => success(successPosition as GeolocationPosition));
          return 1;
        },
        clearWatch() {
          return undefined;
        },
      };

      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: geolocation,
      });
    },
    GEO_POSITION,
  );
}
