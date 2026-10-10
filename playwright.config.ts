import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  fullyParallel: false,
  use: {
    baseURL: process.env.LUCKYVOID_TEST_URL || "http://127.0.0.1:5173",
    headless: true,
  },
  reporter: "list",
  workers: 1,
});
