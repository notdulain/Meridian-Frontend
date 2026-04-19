import { expect, test, type Page } from "@playwright/test";
import { seedAuthSession } from "../../helpers/auth-helper";
import { mockDispatcherWorkflowApis } from "../../helpers/dispatcher-workflow-helper";
import { saveTestScreenshot } from "../../helpers/screenshot-helper";

async function authenticateAsDispatcher(page: Page): Promise<void> {
  await seedAuthSession(page, "Dispatcher");
}

async function expectWorkflowCard(page: Page, heading: string) {
  const card = page.locator(".card").filter({
    has: page.getByRole("heading", { name: heading }),
  });

  await expect(card).toBeVisible();
  return card;
}

async function clickFirstWorkflowOption(page: Page, heading: string): Promise<void> {
  const card = await expectWorkflowCard(page, heading);
  const option = card.getByRole("button").first();
  await expect(option).toBeVisible();
  await option.click();
}

function formatAssignmentTimestamp(value: Date): string {
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDashboardTimestamp(value: Date): string {
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

test.describe("Dispatcher workflow UI", () => {
  test("shows the dispatcher dashboard after authentication", async ({ page }) => {
    const referenceTime = new Date();
    await mockDispatcherWorkflowApis(page, referenceTime);
    await authenticateAsDispatcher(page);

    await page.goto("/dashboard/dispatcher");
    await expect(page).toHaveURL(/\/dashboard\/dispatcher$/);
    await expect(page.getByRole("heading", { name: "Dispatcher Workflow" })).toBeVisible();

    await expect(page.getByText("Operations Snapshot")).toBeVisible();
    await expect(page.locator(".metric-summary-timestamp")).toHaveText(`Last updated: ${formatDashboardTimestamp(referenceTime)}`);

    await saveTestScreenshot(page, "dispatcher-dashboard-after-sign-in.png");
  });

  test("checks the delivery assignment flow from the dispatcher dashboard", async ({ page }) => {
    const referenceTime = new Date();
    await mockDispatcherWorkflowApis(page, referenceTime);
    await authenticateAsDispatcher(page);

    await page.goto("/dashboard/dispatcher");
    await expect(page).toHaveURL(/\/dashboard\/dispatcher$/);
    await expect(page.getByRole("heading", { name: "Dispatcher Workflow" })).toBeVisible();

    await expect(page.getByText("1. Select Delivery")).toBeVisible();
    await clickFirstWorkflowOption(page, "Step 1: Select Delivery");
    await clickFirstWorkflowOption(page, "Step 2: Select Vehicle");
    await clickFirstWorkflowOption(page, "Step 3: Select Driver");
    await clickFirstWorkflowOption(page, "Step 4: Select Route");

    const confirmButton = page.getByRole("button", { name: "Confirm Assignment" });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    await expect(page.getByRole("button", { name: "Yes, Create Assignment" })).toBeVisible();
    await page.getByRole("button", { name: "Yes, Create Assignment" }).click();

    await expect(page.getByText("Assignment created successfully.")).toBeVisible();
    await saveTestScreenshot(page, "dispatcher-assignment-flow.png");
  });

  test("shows the dispatcher map with live telemetry markers", async ({ page }) => {
    const referenceTime = new Date();
    await mockDispatcherWorkflowApis(page, referenceTime);
    await authenticateAsDispatcher(page);

    await page.goto("/tracking", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/tracking$/);
    await expect(page.getByText("Operations / Live Tracking")).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("heading", { name: "Active Deployments" })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("heading", { name: "Global Telemetry" })).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);

    await saveTestScreenshot(page, "dispatcher-map.png");
  });

  test("renders timestamp fields on the dashboard and assignments page", async ({ page }) => {
    const referenceTime = new Date();
    await mockDispatcherWorkflowApis(page, referenceTime);
    await authenticateAsDispatcher(page);

    await page.goto("/dashboard/dispatcher");
    await expect(page).toHaveURL(/\/dashboard\/dispatcher$/);
    await expect(page.getByRole("heading", { name: "Dispatcher Workflow" })).toBeVisible();

    await expect(page.locator(".metric-summary-timestamp")).toHaveText(`Last updated: ${formatDashboardTimestamp(referenceTime)}`);

    await page.goto("/assignments");
    await expect(page).toHaveURL(/\/assignments$/);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
    await expect(page.getByText("Assigned At")).toBeVisible();
    await expect(page.locator("tbody tr").first().locator("td").nth(5)).toHaveText(formatAssignmentTimestamp(referenceTime));

    await saveTestScreenshot(page, "dispatcher-timestamps.png");
  });
});
