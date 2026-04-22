import { expect, test } from "@playwright/test";
import { prepareAdminDashboardVisual, prepareDispatcherDashboardVisual } from "../../helpers/visual-helper";

test("admin dashboard visual regression", async ({ page }) => {
  await prepareAdminDashboardVisual(page);

  await expect(page).toHaveScreenshot("admin-dashboard.png", {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
  });
});

test("dispatcher dashboard visual regression", async ({ page }) => {
  await prepareDispatcherDashboardVisual(page);

  await expect(page).toHaveScreenshot("dispatcher-dashboard.png", {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
  });
});
