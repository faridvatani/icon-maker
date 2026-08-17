import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4173/icon-maker/",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm vite preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/icon-maker/",
    reuseExistingServer: !process.env.CI,
  },
});
