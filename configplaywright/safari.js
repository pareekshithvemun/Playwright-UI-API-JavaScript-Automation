// @ts-check
import { defineConfig, devices } from "@playwright/test";
import config from "config";
const BASEURL = config.get("Environment").baseURL;

export default defineConfig({
  testDir: "../tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  timeout: 6 * 1000,
  expect: { timeout: 8000 },
  workers: 2,
  reporter: "html",
  
  // use: {
  //   baseURL: "https://kowshik.front.develop.squads-dev.com",
  //   trace: "on-first-retry",
  // },
  projects: [
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    {
      name: "webkit",
      use: { browserName: "webkit", baseURL:BASEURL},
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
