/**
 * Debug Test: Basic Navigation
 * Simple test to debug what's actually on the dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Debug: Basic Navigation', () => {
  test('Debug dashboard content', async ({ page }) => {
    // Given: User is on the application
    await page.goto('/dashboard');
    
    // When: Page loads
    await page.waitForLoadState('networkidle');
    
    // Then: Let's see what's actually there
    console.log('Page URL:', page.url());
    
    // Take a screenshot to see what's there
    await page.screenshot({ path: 'debug-dashboard.png' });
    
    // Check if welcome text exists
    const welcomeText = await page.getByText('Welcome to NeutralApp').count();
    console.log('Welcome text count:', welcomeText);
    
    // Check if any other text exists
    const allText = await page.locator('body').textContent();
    console.log('All text on page:', allText?.substring(0, 500));
    
    // Check if browse plugins button exists
    const browseButton = await page.locator('[data-testid="browse-plugins"]').count();
    console.log('Browse plugins button count:', browseButton);
    
    // Check if settings link exists
    const settingsLink = await page.locator('[data-testid="settings-link"]').count();
    console.log('Settings link count:', settingsLink);
    
    // Check if admin link exists
    const adminLink = await page.locator('[data-testid="admin-link"]').count();
    console.log('Admin link count:', adminLink);
  });
}); 