import { expect, test } from "@playwright/test";
import { mockDashboardSummaryApi, seedAuthSession } from "../../helpers/auth-helper";

test("unauthenticated user trying to access a protected page is redirected to login", async ({ page }) => {
  await mockDashboardSummaryApi(page);

  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Sign in to Meridian" })).toBeVisible();
});

test("session token navigation behaves correctly after login", async ({ page }) => {
  await seedAuthSession(page, "Admin");
  await mockDashboardSummaryApi(page);

  await page.goto("/");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
});

test("basic dashboard loads correctly after authentication", async ({ page }) => {
  await seedAuthSession(page, "Admin");
  await mockDashboardSummaryApi(page);

  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByText("System overview and fleet management analytics")).toBeVisible();
});
