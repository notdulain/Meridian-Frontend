import type { Page, Route } from "@playwright/test";

export type AuthRole = "Admin" | "Dispatcher" | "Driver";

type Credentials = {
  email: string;
  password: string;
};

type SessionUser = {
  id: number;
  email: string;
  name?: string;
};

type DashboardSummary = {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  overdueDeliveries: number;
  availableVehicles: number;
  vehiclesOnTrip: number;
  availableDrivers: number;
  activeAssignments: number;
  pendingDeliveries: number;
  generatedAtUtc: string;
};

const ROLE_IDS: Record<AuthRole, number> = {
  Admin: 1,
  Dispatcher: 2,
  Driver: 3,
};

const DEFAULT_SUMMARY: DashboardSummary = {
  totalDeliveries: 42,
  activeDeliveries: 9,
  completedDeliveries: 31,
  overdueDeliveries: 2,
  availableVehicles: 7,
  vehiclesOnTrip: 5,
  availableDrivers: 4,
  activeAssignments: 6,
  pendingDeliveries: 12,
  generatedAtUtc: "2026-04-18T00:00:00.000Z",
};

const ENV_DEFAULTS: Record<string, string> = {
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "ChangeMe123!",
  DISPATCHER_EMAIL: "dispatcher@example.com",
  DISPATCHER_PASSWORD: "ChangeMe123!",
  USER_EMAIL: "user@example.com",
  USER_PASSWORD: "ChangeMe123!",
};

function requiredEnv(name: string): string {
  const value = process.env[name] ?? ENV_DEFAULTS[name];
  if (!value) {
    throw new Error(`Missing required test environment variable: ${name}`);
  }
  return value;
}

export function getCredentialsForRole(role: AuthRole): Credentials {
  if (role === "Admin") {
    return {
      email: requiredEnv("ADMIN_EMAIL"),
      password: requiredEnv("ADMIN_PASSWORD"),
    };
  }

  if (role === "Dispatcher") {
    return {
      email: requiredEnv("DISPATCHER_EMAIL"),
      password: requiredEnv("DISPATCHER_PASSWORD"),
    };
  }

  return {
    email: requiredEnv("USER_EMAIL"),
    password: requiredEnv("USER_PASSWORD"),
  };
}

export function createMockToken(role: AuthRole, email: string, userId: number = ROLE_IDS[role]): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role, sub: String(userId), email })).toString("base64url");
  return `${header}.${payload}.signature`;
}

export async function seedAuthSession(page: Page, role: AuthRole, user?: Partial<SessionUser>): Promise<void> {
  const credentials = getCredentialsForRole(role);
  const sessionUser: SessionUser = {
    id: user?.id ?? ROLE_IDS[role],
    email: user?.email ?? credentials.email,
    name: user?.name,
  };
  const token = createMockToken(role, sessionUser.email, sessionUser.id);

  await page.addInitScript(
    ({ tokenValue, roleValue, userValue }) => {
      localStorage.setItem("meridian_token", tokenValue);
      localStorage.setItem("meridian_role", roleValue);
      localStorage.setItem("meridian_user", JSON.stringify(userValue));
    },
    {
      tokenValue: token,
      roleValue: role,
      userValue: sessionUser,
    },
  );
}

export async function mockLoginApi(page: Page): Promise<void> {
  await page.route("**/api/auth/login", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    let body: { email?: string; password?: string };
    try {
      body = route.request().postDataJSON() as { email?: string; password?: string };
    } catch {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid login payload." }),
      });
      return;
    }

    const matchedRole = (["Admin", "Dispatcher", "Driver"] as const).find((role) => {
      const credentials = getCredentialsForRole(role);
      return credentials.email === body.email && credentials.password === body.password;
    });

    if (!matchedRole || !body.email) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid email or password." }),
      });
      return;
    }

    const accessToken = createMockToken(matchedRole, body.email);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken,
        refreshToken: `${matchedRole.toLowerCase()}-refresh-token`,
      }),
    });
  });
}

export async function mockDashboardSummaryApi(page: Page, summary: Partial<DashboardSummary> = {}): Promise<void> {
  await page.route("**/api/dashboard/summary", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...DEFAULT_SUMMARY, ...summary }),
    });
  });
}

export async function mockDispatcherDashboardApi(page: Page): Promise<void> {
  await mockDashboardSummaryApi(page);

  await page.route("**/delivery/api/deliveries**", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/driver/api/drivers/available", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}
