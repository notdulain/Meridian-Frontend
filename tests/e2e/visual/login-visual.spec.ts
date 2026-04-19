import { expect, test } from "@playwright/test";
import { prepareLoginVisual } from "../../helpers/visual-helper";

test("login page visual regression", async ({ page }) => {
  await prepareLoginVisual(page);

  await expect(page).toHaveScreenshot("login-page.png", {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
  });
});
