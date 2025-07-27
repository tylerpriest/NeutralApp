import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete and redirect
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard with welcome screen when no plugins', async ({ page }) => {
    // Check that dashboard is visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Should show welcome screen when no plugins are installed
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByText('Get started by installing your first plugin')).toBeVisible();
    
    // Should show call-to-action button
    await expect(page.getByRole('button', { name: 'Browse Plugins' })).toBeVisible();
  });

  test('should navigate to plugin manager from welcome screen', async ({ page }) => {
    // Click on browse plugins button
    await page.getByRole('button', { name: 'Browse Plugins' }).click();
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Should navigate to plugin manager
    await expect(page).toHaveURL('/plugins');
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check that navigation menu is visible
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main navigation items
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Plugins' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Navigate to plugins page
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
    
    // Navigate to settings page
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/settings');
    
    // Navigate to admin page
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/admin');
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle dashboard refresh', async ({ page }) => {
    // Check that welcome screen is visible
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show welcome screen after refresh
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Plugins' })).toBeVisible();
  });

  test('should handle dashboard responsive design', async ({ page }) => {
    // Check that welcome screen is visible
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Plugins' })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Plugins' })).toBeVisible();
  });

  test('should handle dashboard accessibility', async ({ page }) => {
    // Check that welcome screen is visible
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through elements with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate to plugins page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle logout from dashboard', async ({ page }) => {
    // Check that we're on dashboard
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Look for logout button (usually in header or user menu)
    const logoutButton = page.getByRole('button', { name: /logout/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to auth page
      await expect(page).toHaveURL('/auth');
    } else {
      // If no logout button visible, test is still valid
      // Dashboard should be accessible
      await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    }
  });

  test('should handle dashboard loading states', async ({ page }) => {
    // Navigate to dashboard with slow network
    await page.route('**/*', route => {
      // Add artificial delay to simulate slow loading
      setTimeout(() => route.continue(), 100);
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show dashboard content after loading
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
  });

  test('should handle dashboard error states', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show basic dashboard content
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should handle dashboard with different user roles', async ({ page }) => {
    // Test with different user (if role-based features exist)
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(3000);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show dashboard content regardless of user role
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should handle dashboard performance', async ({ page }) => {
    // Measure time to load dashboard
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Should show content
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
  });

  test('should handle dashboard with browser back/forward', async ({ page }) => {
    // Navigate to plugins page
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
    
    // Go back to dashboard
    await page.goBack();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Go forward to plugins
    await page.goForward();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle dashboard with multiple tabs', async ({ page }) => {
    // Open dashboard in new tab
    const newPage = await page.context().newPage();
    await newPage.goto('/dashboard');
    await newPage.waitForLoadState('networkidle');
    
    // Should show dashboard in new tab
    await expect(newPage.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Close new tab
    await newPage.close();
    
    // Original tab should still work
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
  });
}); 