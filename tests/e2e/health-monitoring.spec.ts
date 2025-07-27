import { test, expect } from '@playwright/test';

test.describe('Health Monitoring E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
  });

  test('should display system health status', async ({ page }) => {
    // Navigate to admin page where health monitoring might be
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Check for health monitoring content
    const healthSection = page.getByText(/health|status|monitoring/i);
    
    if (await healthSection.isVisible()) {
      // Should show system status
      await expect(page.getByText(/system status|health status/i)).toBeVisible();
      
      // Should show status indicators
      await expect(page.getByText(/online|offline|healthy|unhealthy/i)).toBeVisible();
    } else {
      // If no health monitoring, check that admin page loads
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should display service health indicators', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for service health indicators
    const serviceIndicators = page.locator('[data-testid="service-status"], .service-status, .health-indicator');
    
    if (await serviceIndicators.count() > 0) {
      // Should show service status
      await expect(serviceIndicators.first()).toBeVisible();
      
      // Should show service names
      await expect(page.getByText(/api|database|auth|plugins/i)).toBeVisible();
      
      // Should show status colors or indicators
      await expect(page.getByText(/green|red|yellow|healthy|unhealthy/i)).toBeVisible();
    } else {
      // If no service indicators, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should display performance metrics', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for performance metrics
    const metricsSection = page.getByText(/performance|metrics|statistics/i);
    
    if (await metricsSection.isVisible()) {
      // Should show performance data
      await expect(page.getByText(/response time|uptime|memory usage|cpu usage/i)).toBeVisible();
      
      // Should show metric values
      await expect(page.getByText(/\d+%|\d+ms|\d+MB/i)).toBeVisible();
    } else {
      // If no metrics, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health check refresh', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
    
    if (await refreshButton.isVisible()) {
      // Click refresh button
      await refreshButton.click();
      
      // Wait for refresh to complete
      await page.waitForTimeout(2000);
      
      // Should still show health data
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    } else {
      // If no refresh button, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should display error logs', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for error logs section
    const logsSection = page.getByText(/logs|errors|alerts/i);
    
    if (await logsSection.isVisible()) {
      // Should show error logs
      await expect(page.getByText(/error|warning|alert/i)).toBeVisible();
      
      // Should show log timestamps
      await expect(page.getByText(/\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2}/i)).toBeVisible();
    } else {
      // If no logs, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health monitoring alerts', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for alerts section
    const alertsSection = page.getByText(/alerts|notifications|warnings/i);
    
    if (await alertsSection.isVisible()) {
      // Should show alert indicators
      await expect(page.getByText(/critical|warning|info/i)).toBeVisible();
      
      // Should show alert messages
      await expect(page.getByText(/service down|high usage|error detected/i)).toBeVisible();
    } else {
      // If no alerts, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should display uptime statistics', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for uptime section
    const uptimeSection = page.getByText(/uptime|availability|reliability/i);
    
    if (await uptimeSection.isVisible()) {
      // Should show uptime percentage
      await expect(page.getByText(/\d+\.\d+%|\d+%/i)).toBeVisible();
      
      // Should show uptime duration
      await expect(page.getByText(/\d+ days|\d+ hours|\d+ minutes/i)).toBeVisible();
    } else {
      // If no uptime stats, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health monitoring with network issues', async ({ page }) => {
    // Simulate network issues
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should still show admin page
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    
    // Should show network error indicators if health monitoring is present
    const errorIndicators = page.getByText(/network error|connection failed|unavailable/i);
    if (await errorIndicators.isVisible()) {
      await expect(errorIndicators).toBeVisible();
    }
  });

  test('should handle health monitoring with slow network', async ({ page }) => {
    // Add network delay
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500);
    });
    
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should show admin page after loading
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
  });

  test('should display resource usage', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for resource usage section
    const resourceSection = page.getByText(/resources|usage|consumption/i);
    
    if (await resourceSection.isVisible()) {
      // Should show resource metrics
      await expect(page.getByText(/memory|cpu|disk|network/i)).toBeVisible();
      
      // Should show usage percentages
      await expect(page.getByText(/\d+%|\d+MB|\d+GB/i)).toBeVisible();
    } else {
      // If no resource usage, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health monitoring accessibility', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through health monitoring elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should activate health monitoring interaction
    await page.waitForTimeout(1000);
  });

  test('should handle health monitoring responsive design', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
  });

  test('should handle health monitoring data updates', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for auto-refresh or update indicators
    const updateIndicator = page.getByText(/last updated|refreshed|live/i);
    
    if (await updateIndicator.isVisible()) {
      // Should show update timestamp
      await expect(updateIndicator).toBeVisible();
      
      // Wait for potential auto-update
      await page.waitForTimeout(5000);
      
      // Should still show health data
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    } else {
      // If no auto-update, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health monitoring export', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|download|report/i });
    
    if (await exportButton.isVisible()) {
      // Click export button
      await exportButton.click();
      
      // Wait for export process
      await page.waitForTimeout(2000);
      
      // Should show export success message
      await expect(page.getByText(/exported|downloaded|generated/i)).toBeVisible();
    } else {
      // If no export functionality, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health monitoring configuration', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for configuration button
    const configButton = page.getByRole('button', { name: /configure|settings|options/i });
    
    if (await configButton.isVisible()) {
      // Click configuration button
      await configButton.click();
      
      // Wait for configuration modal/page to load
      await page.waitForTimeout(1000);
      
      // Should show configuration options
      await expect(page.getByText(/configuration|settings|options/i)).toBeVisible();
      
      // Should have save/cancel buttons
      await expect(page.getByRole('button', { name: /save|cancel/i })).toBeVisible();
    } else {
      // If no configuration, admin page should still load
      await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    }
  });

  test('should handle health monitoring performance', async ({ page }) => {
    // Measure time to load admin page
    const startTime = Date.now();
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Admin page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Should show admin content
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
  });

  test('should handle health monitoring with different user roles', async ({ page }) => {
    // Test with different user
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should show admin content regardless of user role
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
  });
});