import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  }],
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://127.0.0.1:3100/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgres://in2weeks:in2weeks@localhost:5432/in2weeks",
      NEXTAUTH_URL: "http://127.0.0.1:3100",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "playwright-only-secret",
      EMAIL_SERVER: process.env.EMAIL_SERVER ?? "smtp://127.0.0.1:1025",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "In2Weeks <e2e@in2weeks.local>",
    },
  },
});
