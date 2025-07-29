import { test, expect } from '@playwright/test';

test.describe('Current UI Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login
    await page.goto('http://localhost:3001');
    
    // Check if we need to login
    const isAuthPage = await page.locator('text=Welcome back').isVisible();
    if (isAuthPage) {
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('http://localhost:3001/');
    }
  });

  test('dashboard page screenshot', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-dashboard-full.png', { fullPage: true });
  });

  test('plugins page screenshot', async ({ page }) => {
    await page.goto('http://localhost:3001/plugins');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-plugins-full.png', { fullPage: true });
  });

  test('settings page screenshot', async ({ page }) => {
    await page.goto('http://localhost:3001/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-settings-full.png', { fullPage: true });
  });

  test('admin page screenshot', async ({ page }) => {
    await page.goto('http://localhost:3001/admin');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-admin-full.png', { fullPage: true });
  });

  test('navigation component screenshot', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    const navigation = page.locator('nav');
    await expect(navigation).toHaveScreenshot('current-navigation.png');
  });

  test('header component screenshot', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    const header = page.locator('header, [role="banner"]');
    await expect(header).toHaveScreenshot('current-header.png');
  });

  test('mobile viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-mobile.png');
  });

  test('tablet viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-tablet.png');
  });
}); 