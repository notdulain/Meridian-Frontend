import { expect, test } from "@playwright/test";
import { authenticateAsDriver, mockDriverDashboardApis, mockDriverGeolocation } from "../../helpers/driver-workflow-helper";
import { saveTestScreenshot } from "../../helpers/screenshot-helper";

test.describe("Driver dashboard screenshots", () => {
  test("captures the active driver dashboard state", async ({ page }) => {
    await mockDriverDashboardApis(page, true);
    await mockDriverGeolocation(page);
    await authenticateAsDriver(page);

    await page.goto("/driver/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/driver\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Driver Dashboard" })).toBeVisible();
    await expect(page.getByText("Current Assignment: #9001")).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("heading", { name: "Live Position" })).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 20000 });
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1, { timeout: 20000 });
    await expect(page.getByText("GPS Tracking")).toBeVisible();
    await expect(page.getByText("ACTIVE")).toBeVisible();
    await expect(page.getByText("Last GPS sync:")).toBeVisible();

    await saveTestScreenshot(page, "driver-dashboard-active.png");
  });

  test("captures the idle driver dashboard state", async ({ page }) => {
    await mockDriverDashboardApis(page, false);
    await authenticateAsDriver(page);

    await page.goto("/driver/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/driver\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Driver Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "No Active Assignments" })).toBeVisible();
    await expect(page.getByText("Wait for dispatch.")).toBeVisible();

    await saveTestScreenshot(page, "driver-dashboard-idle.png");
  });
});
