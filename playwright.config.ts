import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E runs against a production build (`npm run build` first) and a disposable
 * MongoDB (E2E_MONGODB_URI). Global setup seeds it; auth uses real signed
 * Auth.js session cookies, so no test-only bypass exists in the app.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec/ },
  ],
  webServer: {
    // Same entrypoint as the Docker image: the standalone server plus copied static assets.
    command: `cp -R .next/static .next/standalone/.next/ && cp -R public .next/standalone/ && PORT=${PORT} exec node .next/standalone/server.js`,
    url: `${baseURL}/api/health`,
    // Never reuse: a server from an older build would serve HTML pointing at deleted chunks.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      MONGODB_URI: process.env.E2E_MONGODB_URI ?? "mongodb://127.0.0.1:27018",
      MONGODB_DB: "bloodlink_e2e",
      AUTH_SECRET: process.env.E2E_AUTH_SECRET ?? "e2e-secret-e2e-secret-e2e-secret-e2e-secret",
      AUTH_GOOGLE_ID: "e2e-google-id",
      AUTH_GOOGLE_SECRET: "e2e-google-secret",
      DATA_ENCRYPTION_KEY: process.env.E2E_DATA_KEY ?? "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      ADMIN_EMAILS: "admin@e2e.test",
    },
  },
});
