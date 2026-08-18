import { defineConfig, devices } from "@playwright/test";

const usePrebuiltApplication = process.env.PLAYWRIGHT_PREBUILT === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4173/icon-maker/",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: usePrebuiltApplication
      ? "pnpm vite preview --host 127.0.0.1 --port 4173"
      : "pnpm build && pnpm vite preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/icon-maker/",
    reuseExistingServer: !process.env.CI,
  },
});
