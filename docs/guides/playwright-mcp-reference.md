# 🎭 Playwright MCP Reference for Cursor IDE

A comprehensive guide to using Playwright with Model Context Protocol (MCP) inside Cursor IDE, supporting both headless and UI modes, multi-project configuration, and all relevant CLI test run options.

## ✅ Verification Status

**Last Updated**: July 27, 2024  
**Status**: ✅ **Verified and Accurate**  
**Configuration Files**: 
- `playwright.config.ts` - Main configuration with comprehensive browser support
- `playwright.config.basic.ts` - Simplified configuration for basic testing
- `tests/e2e/` - End-to-end test suite with 8 test files

## 🎯 Basic Test Execution

### Headless Mode (Default)
```bash
# Run all tests in headless mode
npx playwright test

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching pattern
npx playwright test -g "login"

# Run with specific configuration
npx playwright test --config=playwright.config.basic.ts
```

### Headed Mode (UI Visible)
```bash
# Run all tests with browser UI visible
npx playwright test --headed

# Run specific project in headed mode
npx playwright test --project=webkit --headed
```

### UI Mode (Playwright Test UI)
```bash
# Launch Playwright Test UI
npx playwright test --ui

# UI mode with specific project
npx playwright test --ui --project=debug-webkit
```

### Project-Specific Execution
```bash
# Run specific project (e.g., chromium)
npx playwright test --project=chromium

# Run multiple projects
npx playwright test --project=chromium --project=firefox

# Run mobile projects
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"

# Run all projects except one
npx playwright test --project=webkit --project=firefox
```

## ⚙️ Useful CLI Options Table

| Command | Description |
|---------|-------------|
| `--project=<name>` | Run tests for specific project |
| `--headed` | Run tests with browser UI visible |
| `--ui` | Launch Playwright Test UI |
| `--debug` | Run tests in debug mode |
| `--trace on` | Record trace for all tests |
| `--trace on-first-retry` | Record trace only on retries |
| `--reporter=<name>` | Use specific reporter (list, json, html, etc.) |
| `--workers=<number>` | Set number of parallel workers |
| `--timeout=<ms>` | Set test timeout |
| `--retries=<number>` | Set number of retries |
| `-g "<pattern>"` | Run tests matching pattern |
| `--grep-invert` | Invert grep pattern |
| `--max-failures=<number>` | Stop after N failures |
| `--shard=<shard>/<total>` | Split tests across shards |
| `--update-snapshots` | Update visual comparison snapshots |
| `--config=<path>` | Use custom config file |

## 🛠 Manual MCP Usage

### Starting MCP Server Manually
```bash
# Start MCP server on default port
npx @playwright/mcp@latest

# Start on specific port
npx @playwright/mcp@latest --port 8931

# Start with specific browser
npx @playwright/mcp@latest --browser chromium
```

### Cursor IDE Integration
Once the MCP server is running, Cursor IDE will automatically connect and provide:
- **Browser Control**: Direct browser manipulation through Cursor
- **Element Inspection**: Click and interact with elements
- **Screenshot Capture**: Take screenshots directly from Cursor
- **Console Access**: View browser console messages
- **Network Monitoring**: Track network requests

**Key Advantage**: No more manual console copy-paste - MCP provides seamless integration!

## 🧪 Example playwright.config.ts

The project includes two Playwright configurations:

### Main Configuration (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Desktop browsers
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Mobile browsers
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    // Additional configurations...
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Basic Configuration (`playwright.config.basic.ts`)
Simplified configuration for basic testing:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Debug project for development
    {
      name: 'debug-webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: false,
        devtools: true,
        viewport: { width: 1280, height: 720 }
      },
    },
    
    // Standard browser projects
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: true
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: true
      },
    },
    
    // Mobile testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: true
      },
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        headless: true
      },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🔍 Debugging & Trace Tools

### Recording and Viewing Traces
```bash
# Record trace for all tests
npx playwright test --trace on

# Record trace only on retries
npx playwright test --trace on-first-retry

# View trace file
npx playwright show-trace trace.zip
```

### Using page.pause() for Debugging
```typescript
import { test, expect } from '@playwright/test';

test('debug example', async ({ page }) => {
  await page.goto('https://example.com');
  
  // Pause execution and open DevTools
  await page.pause();
  
  // Continue with test
  await expect(page.locator('h1')).toBeVisible();
});
```

### DevTools Configuration
```typescript
// In playwright.config.ts
use: {
  devtools: true, // Opens DevTools automatically
  headless: false, // Required for DevTools
}
```

### Debug Mode
```bash
# Run in debug mode (opens browser with DevTools)
npx playwright test --debug

# Debug specific test
npx playwright test auth.spec.ts --debug

# Debug with specific project
npx playwright test --project=debug-webkit --debug
```

## 🎨 Advanced Configuration Options

### Viewport and Device Settings
```typescript
use: {
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
  isMobile: false,
  hasTouch: false,
}
```

### Browser Context Options
```typescript
use: {
  acceptDownloads: true,
  ignoreHTTPSErrors: true,
  bypassCSP: true,
  userAgent: 'Custom User Agent String',
}
```

### Screenshot and Video Settings
```typescript
use: {
  screenshot: 'only-on-failure', // 'off' | 'on' | 'only-on-failure'
  video: 'retain-on-failure', // 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
}
```

## 🚀 Best Practices

### 1. **Project Organization**
- Use descriptive project names (`debug-webkit`, `production-chrome`)
- Group related configurations together
- Keep debug projects separate from CI projects

### 2. **MCP Integration**
- Always use MCP for interactive debugging in Cursor
- Leverage browser control features for element inspection
- Use screenshot capabilities for visual debugging

### 3. **Performance Optimization**
- Use `--workers` to control parallel execution
- Implement proper test isolation
- Use `--shard` for large test suites

### 4. **CI/CD Integration**
```bash
# Install browsers in CI
npx playwright install --with-deps

# Run tests with specific configuration
npx playwright test --project=chromium --reporter=json
```

## 🔧 Troubleshooting

### Common Issues

**MCP Connection Failed**
```bash
# Restart MCP server
npx @playwright/mcp@latest --port 8931
```

**Browser Not Found**
```bash
# Install specific browser
npx playwright install webkit
```

**Tests Hanging**
```bash
# Increase timeout
npx playwright test --timeout=60000
```

**Memory Issues**
```bash
# Reduce workers
npx playwright test --workers=1
```

---

## 📚 Additional Resources

- [Playwright Official Documentation](https://playwright.dev/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Cursor IDE Documentation](https://cursor.sh/docs)
- [Playwright Test API Reference](https://playwright.dev/docs/api/class-test)

---

*This reference document provides everything you need to effectively use Playwright with MCP in Cursor IDE, from basic setup to advanced debugging techniques.* 