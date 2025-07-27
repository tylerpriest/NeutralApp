import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * 
 * These tests ensure UI consistency by comparing screenshots
 * of key components and pages against baseline images.
 * 
 * To update baselines: npx playwright test --update-snapshots
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Authentication Pages', () => {
    test('login page should match baseline', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Wait for the form to be visible
      await page.waitForSelector('.auth-form');
      
      // Take screenshot of the entire auth page
      await expect(page).toHaveScreenshot('auth-login-page.png');
    });

    test('register form should match baseline', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Switch to register mode
      await page.click('text=Don\'t have an account? Sign up');
      await page.waitForSelector('.auth-form');
      
      // Take screenshot of the register form
      await expect(page).toHaveScreenshot('auth-register-form.png');
    });

    test('reset password form should match baseline', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Switch to reset password mode
      await page.click('text=Forgot your password?');
      await page.waitForSelector('.auth-form');
      
      // Take screenshot of the reset password form
      await expect(page).toHaveScreenshot('auth-reset-password-form.png');
    });
  });

  test.describe('Dashboard Components', () => {
    test('dashboard layout should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for dashboard components to load
      await page.waitForSelector('.dashboard-page');
      
      // Take screenshot of the dashboard
      await expect(page).toHaveScreenshot('dashboard-layout.png');
    });

    test('welcome screen should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for welcome screen
      await page.waitForSelector('.welcome-screen');
      
      // Take screenshot of the welcome screen
      await expect(page).toHaveScreenshot('welcome-screen.png');
    });
  });

  test.describe('Navigation Components', () => {
    test('main navigation should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for navigation
      await page.waitForSelector('.navigation');
      
      // Take screenshot of the navigation
      await expect(page.locator('.navigation')).toHaveScreenshot('main-navigation.png');
    });

    test('header component should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for header
      await page.waitForSelector('.header');
      
      // Take screenshot of the header
      await expect(page.locator('.header')).toHaveScreenshot('header-component.png');
    });
  });

  test.describe('Settings Pages', () => {
    test('settings page should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to settings
      await page.click('text=Settings');
      await page.waitForURL('/settings');
      await page.waitForLoadState('networkidle');
      
      // Wait for settings page to load
      await page.waitForSelector('.settings-page');
      
      // Take screenshot of the settings page
      await expect(page).toHaveScreenshot('settings-page.png');
    });

    test('settings navigation should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to settings
      await page.click('text=Settings');
      await page.waitForURL('/settings');
      await page.waitForLoadState('networkidle');
      
      // Wait for settings navigation
      await page.waitForSelector('.settings-navigation');
      
      // Take screenshot of the settings navigation
      await expect(page.locator('.settings-navigation')).toHaveScreenshot('settings-navigation.png');
    });
  });

  test.describe('Plugin Management', () => {
    test('plugin manager page should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to plugin manager
      await page.click('text=Plugins');
      await page.waitForURL('/plugins');
      await page.waitForLoadState('networkidle');
      
      // Wait for plugin manager page to load
      await page.waitForSelector('.plugin-manager-page');
      
      // Take screenshot of the plugin manager page
      await expect(page).toHaveScreenshot('plugin-manager-page.png');
    });
  });

  test.describe('Admin Dashboard', () => {
    test('admin dashboard should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to admin
      await page.click('text=Admin');
      await page.waitForURL('/admin');
      await page.waitForLoadState('networkidle');
      
      // Wait for admin dashboard to load
      await page.waitForSelector('.admin-page');
      
      // Take screenshot of the admin dashboard
      await expect(page).toHaveScreenshot('admin-dashboard.png');
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile viewport should match baseline', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to auth page
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Wait for the form to be visible
      await page.waitForSelector('.auth-form');
      
      // Take screenshot of mobile auth page
      await expect(page).toHaveScreenshot('auth-login-mobile.png');
    });

    test('tablet viewport should match baseline', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Navigate to auth page
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Wait for the form to be visible
      await page.waitForSelector('.auth-form');
      
      // Take screenshot of tablet auth page
      await expect(page).toHaveScreenshot('auth-login-tablet.png');
    });
  });

  test.describe('Error States', () => {
    test('error boundary should match baseline', async ({ page }) => {
      // Login first
      await page.goto('/auth');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/');
      await page.waitForLoadState('networkidle');
      
      // Trigger an error (this would need to be implemented)
      // For now, we'll just test the error boundary component
      await page.evaluate(() => {
        // Simulate an error
        const errorEvent = new ErrorEvent('error', { 
          message: 'Test error',
          filename: 'test.js',
          lineno: 1,
          colno: 1
        });
        window.dispatchEvent(errorEvent);
      });
      
      // Wait a moment for error handling
      await page.waitForTimeout(1000);
      
      // Take screenshot of error state
      await expect(page).toHaveScreenshot('error-boundary.png');
    });

    test('loading states should match baseline', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Fill form and submit to trigger loading state
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for loading state to appear
      await page.waitForSelector('.loading-spinner');
      
      // Take screenshot of loading state
      await expect(page).toHaveScreenshot('loading-state.png');
    });
  });
}); 