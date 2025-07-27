import { test, expect } from '@playwright/test';

test.describe('Performance E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
  });

  test('should load auth page within performance threshold', async ({ page }) => {
    // Measure auth page load time
    const startTime = Date.now();
    
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Auth page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should show auth content
    await expect(page.getByText('Welcome back! Please sign in to continue')).toBeVisible();
  });

  test('should load dashboard within performance threshold', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Measure dashboard load time
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should show dashboard content
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
  });

  test('should load plugin manager within performance threshold', async ({ page }) => {
    // Navigate to plugin manager
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    // Measure plugin manager load time
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Plugin manager should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should show plugin manager content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should load settings page within performance threshold', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Measure settings page load time
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Settings page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should show settings content
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should load admin page within performance threshold', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Measure admin page load time
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Admin page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should show admin content
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
  });

  test('should handle navigation performance', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Measure navigation time between pages
    const startTime = Date.now();
    
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForLoadState('networkidle');
    
    const navigationTime = Date.now() - startTime;
    
    // Navigation should be fast (under 2 seconds)
    expect(navigationTime).toBeLessThan(2000);
    
    // Should navigate successfully
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle authentication performance', async ({ page }) => {
    // Measure login performance
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    const loginTime = Date.now() - startTime;
    
    // Login should complete within 5 seconds
    expect(loginTime).toBeLessThan(5000);
    
    // Should be logged in
    await expect(page.getByText('Welcome back! Please sign in to continue')).not.toBeVisible();
  });

  test('should handle page refresh performance', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Measure refresh performance
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const refreshTime = Date.now() - startTime;
    
    // Page refresh should be fast (under 3 seconds)
    expect(refreshTime).toBeLessThan(3000);
    
    // Should show content after refresh
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
  });

  test('should handle concurrent page loads', async ({ page }) => {
    // Test multiple page loads in sequence
    const pages = ['/dashboard', '/plugins', '/settings', '/admin'];
    const loadTimes: number[] = [];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);
      
      // Each page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }
    
    // Average load time should be reasonable
    const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    expect(averageLoadTime).toBeLessThan(2500);
  });

  test('should handle performance with slow network', async ({ page }) => {
    // Add network delay
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500);
    });
    
    // Navigate to dashboard
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Even with slow network, should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    // Should show content
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
  });

  test('should handle performance with network errors', async ({ page }) => {
    // Simulate network errors for some requests
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Navigate to dashboard
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should handle errors gracefully and load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Should show basic content even with errors
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should handle memory usage during navigation', async ({ page }) => {
    // Navigate through multiple pages to test memory usage
    const pages = ['/dashboard', '/plugins', '/settings', '/admin'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Should show content without memory issues
      await expect(page.getByRole('heading')).toBeVisible();
      
      // Wait a moment between navigations
      await page.waitForTimeout(500);
    }
    
    // Final page should still be responsive
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle performance with large content', async ({ page }) => {
    // Navigate to plugin manager (potentially large content)
    const startTime = Date.now();
    
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should handle large content within reasonable time
    expect(loadTime).toBeLessThan(5000);
    
    // Should show content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle performance with multiple tabs', async ({ page }) => {
    // Open multiple tabs
    const tabs: any[] = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 3; i++) {
      const newPage = await page.context().newPage();
      tabs.push(newPage);
      
      await newPage.goto('/dashboard');
      await newPage.waitForLoadState('networkidle');
    }
    
    const loadTime = Date.now() - startTime;
    
    // Should handle multiple tabs within reasonable time
    expect(loadTime).toBeLessThan(10000);
    
    // All tabs should show content
    for (const tab of tabs) {
      await expect(tab.getByText('Welcome to NeutralApp')).toBeVisible();
      await tab.close();
    }
  });

  test('should handle performance with browser back/forward', async ({ page }) => {
    // Navigate through pages
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    // Measure back navigation performance
    const startTime = Date.now();
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    const backTime = Date.now() - startTime;
    
    // Back navigation should be fast (under 2 seconds)
    expect(backTime).toBeLessThan(2000);
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle performance with form interactions', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Measure form interaction performance
    const startTime = Date.now();
    
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for form submission
    await page.waitForTimeout(3000);
    
    const formTime = Date.now() - startTime;
    
    // Form interaction should be responsive (under 5 seconds)
    expect(formTime).toBeLessThan(5000);
  });

  test('should handle performance with responsive design', async ({ page }) => {
    // Test performance on different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds on all viewports
      expect(loadTime).toBeLessThan(3000);
      
      // Should show content
      await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    }
  });

  test('should handle performance with accessibility features', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test keyboard navigation performance
    const startTime = Date.now();
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    const keyboardTime = Date.now() - startTime;
    
    // Keyboard navigation should be responsive (under 1 second)
    expect(keyboardTime).toBeLessThan(1000);
    
    // Should navigate successfully
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle performance with error recovery', async ({ page }) => {
    // Simulate network error
    await page.route('**/*', route => {
      route.abort('failed');
    });
    
    // Try to navigate
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const errorTime = Date.now() - startTime;
    
    // Should handle errors gracefully within 5 seconds
    expect(errorTime).toBeLessThan(5000);
    
    // Should show some content or error message
    await expect(page.getByRole('heading')).toBeVisible();
  });
}); 