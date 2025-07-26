import { test, expect } from '@playwright/test';

test.describe('Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check that sidebar is visible
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main navigation items
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Plugins' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Click on dashboard link
    await page.getByRole('link', { name: 'Dashboard' }).click();
    
    // Should be on dashboard page
    await expect(page).toHaveURL('/dashboard');
    
    // Should show dashboard content
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should navigate to plugins page', async ({ page }) => {
    // Click on plugins link
    await page.getByRole('link', { name: 'Plugins' }).click();
    
    // Should be on plugins page
    await expect(page).toHaveURL('/plugins');
    
    // Should show plugins content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    // Click on settings link
    await page.getByRole('link', { name: 'Settings' }).click();
    
    // Should be on settings page
    await expect(page).toHaveURL('/settings');
    
    // Should show settings content
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should navigate to admin page', async ({ page }) => {
    // Click on admin link
    await page.getByRole('link', { name: 'Admin' }).click();
    
    // Should be on admin page
    await expect(page).toHaveURL('/admin');
    
    // Should show admin content
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Check that dashboard is active by default
    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveClass(/active/);
    
    // Navigate to plugins
    await page.getByRole('link', { name: 'Plugins' }).click();
    await expect(page).toHaveURL('/plugins');
    
    // Check that plugins is now active
    await expect(page.getByRole('link', { name: 'Plugins' })).toHaveClass(/active/);
    
    // Check that dashboard is no longer active
    await expect(page.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(/active/);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to plugins page
    await page.goto('/plugins');
    
    // Should be on plugins page
    await expect(page).toHaveURL('/plugins');
    
    // Should show plugins content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    
    // Should highlight plugins in navigation
    await expect(page.getByRole('link', { name: 'Plugins' })).toHaveClass(/active/);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to plugins
    await page.getByRole('link', { name: 'Plugins' }).click();
    await expect(page).toHaveURL('/plugins');
    
    // Navigate to settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/plugins');
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/settings');
  });

  test('should handle 404 navigation', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');
    
    // Should show 404 page
    await expect(page.getByText('Page Not Found')).toBeVisible();
    await expect(page.getByText('404')).toBeVisible();
    
    // Should have link back to dashboard
    await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toBeVisible();
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile menu button is visible
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    
    // Check that sidebar is hidden by default on mobile
    await expect(page.getByRole('navigation')).not.toBeVisible();
    
    // Open mobile menu
    await page.getByRole('button', { name: 'Menu' }).click();
    
    // Check that sidebar is now visible
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Navigate to plugins
    await page.getByRole('link', { name: 'Plugins' }).click();
    
    // Should be on plugins page
    await expect(page).toHaveURL('/plugins');
    
    // On mobile, sidebar should close after navigation
    await expect(page.getByRole('navigation')).not.toBeVisible();
  });

  test('should handle responsive navigation on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that sidebar is visible on tablet
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Navigate to settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    
    // Should show settings content
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on navigation
    await page.keyboard.press('Tab');
    
    // Navigate through menu items with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Should navigate to plugins
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle navigation with query parameters', async ({ page }) => {
    // Navigate to plugins with query parameter
    await page.goto('/plugins?category=productivity');
    
    // Should be on plugins page
    await expect(page).toHaveURL('/plugins?category=productivity');
    
    // Should show plugins content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle navigation state persistence', async ({ page }) => {
    // Navigate to settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    
    // Refresh the page
    await page.reload();
    
    // Should still be on settings page
    await expect(page).toHaveURL('/settings');
    
    // Should show settings content
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    
    // Should highlight settings in navigation
    await expect(page.getByRole('link', { name: 'Settings' })).toHaveClass(/active/);
  });
}); 