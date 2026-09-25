import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  globalSetup: './globalSetup.ts',
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['allure-playwright', {
      resultsDir: './allure-results'
    }]
  ],
  use: {
    baseURL: process.env.PROD_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
     {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
     {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
