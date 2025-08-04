import { test, expect } from '@playwright/test';

test.describe('Critical Path Smoke Tests', () => {
  test.setTimeout(60000); // 1 minute total timeout for all smoke tests

  test('application loads and health check passes', async ({ page }) => {
    // Navigate to application
    await page.goto('/');
    
    // Verify page loads without errors
    await expect.soft(page).toHaveTitle(/NeutralApp/i);
    
    // Check health endpoint
    const healthResponse = await page.request.get('/health');
    expect(healthResponse.status()).toBe(200);
    
    const healthData = await healthResponse.json();
    expect(healthData.status).toBe('healthy');
  });

  test('authentication flow functions', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login or show login form
    await page.waitForSelector('[data-testid="login-form"], [data-testid="dashboard"]', { 
      timeout: 10000 
    });
    
    // If login form is present, verify it's functional
    const loginForm = page.locator('[data-testid="login-form"]');
    if (await loginForm.isVisible()) {
      // Verify form elements exist
      await expect(loginForm.locator('input[type="email"], input[type="text"]')).toBeVisible();
      await expect(loginForm.locator('input[type="password"]')).toBeVisible();
      await expect(loginForm.locator('button[type="submit"]')).toBeVisible();
    }
  });

  test('dashboard loads with core widgets', async ({ page }) => {
    await page.goto('/');
    
    // Wait for either login or dashboard
    await page.waitForSelector('[data-testid="login-form"], [data-testid="dashboard"]', {
      timeout: 10000
    });
    
    // If dashboard is visible, verify core components
    const dashboard = page.locator('[data-testid="dashboard"]');
    if (await dashboard.isVisible()) {
      // Verify navigation exists
      await expect.soft(page.locator('nav, [role="navigation"]')).toBeVisible();
      
      // Verify main content area
      await expect.soft(page.locator('main, [role="main"]')).toBeVisible();
      
      // Check for any error states
      const errorElements = page.locator('[data-testid*="error"], .error');
      expect(await errorElements.count()).toBe(0);
    }
  });

  test('plugin system status check', async ({ page }) => {
    // Check plugin API endpoint
    const pluginResponse = await page.request.get('/api/plugins/status');
    
    // Should return plugin information (may be empty array for new installations)
    expect([200, 404]).toContain(pluginResponse.status());
    
    if (pluginResponse.status() === 200) {
      const pluginData = await pluginResponse.json();
      expect(Array.isArray(pluginData) || typeof pluginData === 'object').toBe(true);
    }
  });

  test('error handling works correctly', async ({ page }) => {
    // Test 404 page
    await page.goto('/nonexistent-page');
    
    // Should either show 404 page or redirect to home
    await page.waitForLoadState('networkidle');
    
    // Verify no JavaScript errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate back to home to trigger any pending errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Allow some console errors but not critical ones
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('SyntaxError')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('API endpoints respond correctly', async ({ page }) => {
    // Test auth endpoint
    const authResponse = await page.request.get('/api/auth/status');
    expect([200, 401, 404]).toContain(authResponse.status());
    
    // Test health endpoint (already tested above but included for completeness)
    const healthResponse = await page.request.get('/health');
    expect(healthResponse.status()).toBe(200);
    
    // Test static assets load
    await page.goto('/');
    const response = await page.waitForResponse(response => 
      response.url().includes('.js') || response.url().includes('.css')
    );
    expect([200, 304]).toContain(response.status());
  });

  test('responsive design basics', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // Verify page is still functional
    await expect.soft(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    
    // Verify page is still functional
    await expect.soft(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance Smoke Tests', () => {
  test('page load performance acceptable', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds (generous for smoke test)
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('bundle size reasonable', async ({ page }) => {
    await page.goto('/');
    
    // Check for large bundle files that might indicate issues
    const responses = await Promise.all([
      page.waitForResponse(response => response.url().includes('.js')),
      page.waitForResponse(response => response.url().includes('.css'))
    ]);
    
    for (const response of responses) {
      const contentLength = response.headers()['content-length'];
      if (contentLength) {
        const size = parseInt(contentLength);
        // Individual files should be under 2MB (generous limit)
        expect(size).toBeLessThanOrEqual(2 * 1024 * 1024);
      }
    }
  });
});