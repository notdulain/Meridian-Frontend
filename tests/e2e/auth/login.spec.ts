import { expect, test } from "@playwright/test";
import { LoginPage } from "../../pages/login-page";
import { getCredentialsForRole, mockDashboardSummaryApi, mockLoginApi } from "../../helpers/auth-helper";

test("login page loads correctly", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await expect(loginPage.heading).toBeVisible();
  await expect(page.getByText("Use your Meridian credentials to continue")).toBeVisible();
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
});

test("user can log in with valid credentials", async ({ page }) => {
  await mockLoginApi(page);
  await mockDashboardSummaryApi(page);

  const loginPage = new LoginPage(page);
  const { email, password } = getCredentialsForRole("Admin");

  await loginPage.signIn(email, password);

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByText("System overview and fleet management analytics")).toBeVisible();
});

test("invalid login shows a proper error message", async ({ page }) => {
  await mockLoginApi(page);

  const loginPage = new LoginPage(page);
  const { email, password } = getCredentialsForRole("Admin");

  await loginPage.goto();
  await loginPage.emailInput.fill(email);
  await loginPage.passwordInput.fill(`${password}-wrong`);
  await loginPage.submitButton.click();

  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});
