import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/login", { waitUntil: "domcontentloaded" });
    await this.heading.waitFor({ state: "visible" });
  }

  get heading() {
    return this.page.getByRole("heading", { name: "Sign in to Meridian" });
  }

  get emailInput() {
    return this.page.getByPlaceholder("you@example.com");
  }

  get passwordInput() {
    return this.page.getByPlaceholder("********");
  }

  get submitButton() {
    return this.page.locator('form button[type="submit"]');
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
