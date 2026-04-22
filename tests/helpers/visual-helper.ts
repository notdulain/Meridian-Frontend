import type { Page } from "@playwright/test";
import { mockDashboardSummaryApi, mockDispatcherDashboardApi, seedAuthSession } from "./auth-helper";

export async function prepareLoginVisual(page: Page): Promise<void> {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
}

export async function prepareAdminDashboardVisual(page: Page): Promise<void> {
  await seedAuthSession(page, "Admin");
  await mockDashboardSummaryApi(page);

  await page.goto("/admin/dashboard");
  await page.waitForLoadState("networkidle");
}

export async function prepareDispatcherDashboardVisual(page: Page): Promise<void> {
  await seedAuthSession(page, "Dispatcher");
  await mockDispatcherDashboardApi(page);

  await page.goto("/dashboard/dispatcher");
  await page.waitForLoadState("networkidle");
}
