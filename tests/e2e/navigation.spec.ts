import { test, expect } from '@playwright/test';

test.describe('Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start at auth page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
  });

  test('should redirect unauthenticated users to auth page', async ({ page }) => {
    // Try to access protected pages without authentication
    const protectedPages = ['/dashboard', '/plugins', '/settings', '/admin'];
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to auth page
      await expect(page).toHaveURL('/auth');
      await expect(page.getByText('Welcome back! Please sign in to continue')).toBeVisible();
    }
  });

  test('should allow navigation after authentication', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    // Now try to access protected pages
    const protectedPages = ['/dashboard', '/plugins', '/settings', '/admin'];
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Should not redirect to auth page
      await expect(page).toHaveURL(pagePath);
      await expect(page.getByText('Welcome back! Please sign in to continue')).not.toBeVisible();
    }
  });

  test('should display navigation menu on all pages', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Check navigation on each page
    const pages = [
      { path: '/dashboard', title: 'Dashboard' },
      { path: '/plugins', title: 'Plugin Manager' },
      { path: '/settings', title: 'Settings' },
      { path: '/admin', title: 'Admin' }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // Should show navigation menu
      await expect(page.getByRole('navigation')).toBeVisible();
      
      // Should show page title
      await expect(page.getByRole('heading', { name: pageInfo.title })).toBeVisible();
      
      // Should show all navigation links
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Plugins' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    }
  });

  test('should highlight current page in navigation', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Check that current page is highlighted
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toHaveClass(/active/);
    
    // Navigate to plugins and check highlighting
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForTimeout(1000);
    
    const pluginsLink = page.getByRole('link', { name: 'Plugins' });
    await expect(pluginsLink).toHaveClass(/active/);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Test direct navigation to each page
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
  });

  test('should handle browser back and forward navigation', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Navigate through pages
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Test back navigation
    await page.goBack();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
    
    await page.goBack();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/dashboard');
    
    // Test forward navigation
    await page.goForward();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle navigation with keyboard', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Navigate with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate to plugins page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle navigation with page refresh', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Navigate to plugins page
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on plugins page
    await expect(page).toHaveURL('/plugins');
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle navigation with multiple tabs', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Open new tab
    const newPage = await page.context().newPage();
    await newPage.goto('/dashboard');
    await newPage.waitForLoadState('networkidle');
    
    // Should show dashboard in new tab
    await expect(newPage.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // Navigate in new tab
    await newPage.getByRole('link', { name: 'Plugins' }).click();
    await newPage.waitForTimeout(1000);
    await expect(newPage).toHaveURL('/plugins');
    
    // Original tab should still work
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/settings');
    
    // Close new tab
    await newPage.close();
  });

  test('should handle navigation with slow network', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Add network delay
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 200);
    });
    
    // Navigate to plugins page
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForLoadState('networkidle');
    
    // Should still navigate successfully
    await expect(page).toHaveURL('/plugins');
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle navigation with network errors', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Simulate network errors for API calls
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to navigate
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForLoadState('networkidle');
    
    // Should still navigate to the page (client-side routing)
    await expect(page).toHaveURL('/plugins');
  });

  test('should handle navigation with session expiration', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Navigate to a protected page
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    // Clear session data to simulate expiration
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to another protected page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to auth page
    await expect(page).toHaveURL('/auth');
    await expect(page.getByText('Welcome back! Please sign in to continue')).toBeVisible();
  });

  test('should handle navigation with invalid URLs', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Try to navigate to invalid URL
    await page.goto('/invalid-page');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or redirect to a valid page
    // For now, just check that we don't get stuck on auth page
    await expect(page.getByText('Welcome back! Please sign in to continue')).not.toBeVisible();
  });

  test('should handle navigation performance', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Measure navigation time
    const startTime = Date.now();
    
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
    
    const navigationTime = Date.now() - startTime;
    
    // Navigation should be fast (under 3 seconds)
    expect(navigationTime).toBeLessThan(3000);
    
    // Should show the page content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });
}); 