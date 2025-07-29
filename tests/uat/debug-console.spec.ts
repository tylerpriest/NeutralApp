/**
 * Debug Test: Console Errors
 * Capture console errors to see why React app isn't loading
 */

import { test, expect } from '@playwright/test';

test.describe('Debug: Console Errors', () => {
  test('Capture console errors on dashboard', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Given: User is on the application
    await page.goto('/dashboard');
    
    // When: Page loads
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for any delayed errors
    await page.waitForTimeout(2000);
    
    // Then: Check for errors
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('=== PAGE ERRORS ===');
    pageErrors.forEach(error => console.log(error));
    
    // Check if React root element exists
    const rootElement = await page.locator('#root').count();
    console.log('Root element count:', rootElement);
    
    // Check if any React content is rendered
    const reactContent = await page.locator('#root').innerHTML();
    console.log('React root content:', reactContent.substring(0, 500));
    
    // Check network requests
    console.log('Network requests captured during test');
  });
}); 