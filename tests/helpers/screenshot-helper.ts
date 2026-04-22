import fs from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";

const SCREENSHOT_DIR = path.resolve(process.cwd(), "tests", "e2e", "screenshots");

export async function saveTestScreenshot(page: Page, fileName: string): Promise<string> {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const screenshotPath = path.join(SCREENSHOT_DIR, fileName);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: "disabled",
  });

  return screenshotPath;
}
