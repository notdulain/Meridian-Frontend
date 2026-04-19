import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

const baseURL = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";

function findChromiumExecutable(): string | undefined {
  const explicitPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (explicitPath && fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  if (process.platform !== "win32") {
    return undefined;
  }

  const cacheRoot = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (!fs.existsSync(cacheRoot)) {
    return undefined;
  }

  const candidates = fs.readdirSync(cacheRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
    .map((entry) => path.join(cacheRoot, entry.name))
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));

  for (const candidateDir of candidates) {
    const executableCandidates = [
      path.join(candidateDir, "chrome-win64", "chrome.exe"),
      path.join(candidateDir, "chrome-win", "chrome.exe"),
    ];

    for (const executableCandidate of executableCandidates) {
      if (fs.existsSync(executableCandidate)) {
        return executableCandidate;
      }
    }
  }

  return undefined;
}

const chromiumExecutablePath = findChromiumExecutable();
const launchOptions = chromiumExecutablePath && fs.existsSync(chromiumExecutablePath)
  ? { executablePath: chromiumExecutablePath }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    launchOptions,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.platform === "win32" ? "cmd /c npm run dev" : "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
