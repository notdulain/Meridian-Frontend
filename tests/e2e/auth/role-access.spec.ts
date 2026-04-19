import { expect, test } from "@playwright/test";
import { mockDashboardSummaryApi, mockDispatcherDashboardApi, seedAuthSession } from "../../helpers/auth-helper";

test("authenticated Admin user can access Admin-protected UI/pages", async ({ page }) => {
  await seedAuthSession(page, "Admin");
  await mockDashboardSummaryApi(page);

  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
});

test("unauthorized Dispatcher user cannot access the Admin dashboard", async ({ page }) => {
  await seedAuthSession(page, "Dispatcher");
  await mockDispatcherDashboardApi(page);

  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/dashboard\/dispatcher$/);
  await expect(page.getByRole("heading", { name: "Dispatcher Workflow" })).toBeVisible();
});

test("unauthorized Admin user cannot access the Dispatcher dashboard", async ({ page }) => {
  await seedAuthSession(page, "Admin");
  await mockDispatcherDashboardApi(page);

  await page.goto("/dashboard/dispatcher");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
});
