/**
 * Debug Test: Authentication and Page Rendering
 * Simple test to debug authentication and see what's actually on the page
 */

import { test, expect } from '@playwright/test';

test.describe('Debug: Authentication and Page Rendering', () => {
  test('Debug authentication and page content', async ({ page }) => {
    // Set up guest mode for testing
    await page.addInitScript(() => {
      localStorage.setItem('guest_mode', 'true');
      localStorage.removeItem('auth_token');
    });

    // Given: User is on the application
    await page.goto('/dashboard');

    // When: Page loads
    await page.waitForLoadState('networkidle');

    // Wait a bit more for React to render
    await page.waitForTimeout(5000);

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

    // Then: Let's see what's actually there
    console.log('Page URL:', page.url());

    // Take a screenshot to see what's there
    await page.screenshot({ path: 'debug-auth-dashboard.png' });

    // Check if React root element exists
    const rootElement = await page.locator('#root').count();
    console.log('Root element count:', rootElement);

    // Check if any React content is rendered
    const reactContent = await page.locator('#root').innerHTML();
    console.log('React root content:', reactContent.substring(0, 1000));

    // Check if app div has any content
    const appContent = await page.locator('.app').innerHTML();
    console.log('App div content:', appContent.substring(0, 1000));

    // Check if any text is visible on the page
    const allText = await page.locator('body').textContent();
    console.log('All text on page:', allText?.substring(0, 1000));

    // Check if specific elements exist
    const welcomeText = await page.getByText('Welcome to NeutralApp').count();
    console.log('Welcome text count:', welcomeText);

    // Check if any buttons exist
    const buttons = await page.locator('button').count();
    console.log('Button count:', buttons);

    // Check if any links exist
    const links = await page.locator('a').count();
    console.log('Link count:', links);

    // Check if any divs exist
    const divs = await page.locator('div').count();
    console.log('Div count:', divs);

    // Check localStorage
    const guestMode = await page.evaluate(() => localStorage.getItem('guest_mode'));
    console.log('Guest mode in localStorage:', guestMode);

    // Check if we're redirected to auth page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/auth')) {
      console.log('❌ Redirected to auth page - authentication not working');
    } else {
      console.log('✅ Not redirected to auth page');
    }

    // Check for console messages and errors
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('=== PAGE ERRORS ===');
    pageErrors.forEach(error => console.log(error));
  });
}); 