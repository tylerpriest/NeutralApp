import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.{test,spec}.{js,ts}',
  testIgnore: '**/node_modules/**',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'], // Real-time console output for immediate feedback
    ['html', { outputFolder: 'playwright-report' }], // Rich reports for debugging
    ['json', { outputFile: 'test-results/playwright-results.json' }] // JSON results for analysis
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    /* Debug project optimized for MCP integration */
    {
      name: 'debug-webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: false,
        viewport: { width: 1280, height: 720 }
      },
    },
    
    /* Standard browser projects */
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

  /* MCP Integration Settings */
  /* When using MCP, ensure the server is running before executing tests */
  /* MCP provides browser control, element inspection, and debugging capabilities */
  
  /* Run your local dev server before starting the tests */
  /* This enables running tests outside of Cursor IDE when MCP is not available */
  /* Commented out since we're running the server manually
  webServer: {
    command: 'NODE_ENV=test npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      NODE_ENV: 'test'
    }
  },
  */
}); 