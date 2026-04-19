import { expect, test } from "@playwright/test";
import { mockDashboardSummaryApi, seedAuthSession } from "../../helpers/auth-helper";

test("logout works correctly", async ({ page }) => {
  await seedAuthSession(page, "Admin");
  await mockDashboardSummaryApi(page);

  await page.goto("/admin/dashboard");
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

  await page.getByTitle("Sign out").click();

  await expect(page).toHaveURL(/\/login$/);

  const token = await page.evaluate(() => localStorage.getItem("meridian_token"));
  expect(token).toBeNull();
});
