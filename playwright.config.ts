import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for LQT (Life Quality Tracker).
 *
 * IMPORTANT: The app requires VITE_APP_PASSWORD to be set for login to work.
 * The webServer section below passes it via env. Update the value if your
 * local password differs.
 *
 * Run:
 *   npm run test:e2e          -- headless
 *   npm run test:e2e:ui       -- interactive UI mode
 *   npx playwright test --headed  -- headed browser
 */
export default defineConfig({
  testDir: './e2e',

  /* Maximum time one test can run */
  timeout: 30_000,

  /* Expect timeout */
  expect: {
    timeout: 5_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry once on CI, zero locally */
  retries: process.env.CI ? 1 : 0,

  /* Reporter */
  reporter: process.env.CI ? 'github' : 'list',

  /* Shared settings for all the projects below */
  use: {
    baseURL: 'http://localhost:3030',

    /* Collect trace on first retry */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Only Chromium for now */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the Vite dev server before running tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3030',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      VITE_APP_PASSWORD: process.env.VITE_APP_PASSWORD || 'test123',
    },
  },
});
