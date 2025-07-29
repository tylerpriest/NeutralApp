/**
 * Debug Test: React App Loading
 * Detailed test to see why React components aren't rendering
 */

import { test, expect } from '@playwright/test';

test.describe('Debug: React App Loading', () => {
  test('Debug React app loading and errors', async ({ page }) => {
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
    
    // Wait for React to potentially render
    await page.waitForTimeout(3000);
    
    // Then: Check for errors and React state
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('=== PAGE ERRORS ===');
    pageErrors.forEach(error => console.log(error));
    
    // Check if React root element exists
    const rootElement = await page.locator('#root').count();
    console.log('Root element count:', rootElement);
    
    // Check if any React content is rendered
    const reactContent = await page.locator('#root').innerHTML();
    console.log('React root content:', reactContent);
    
    // Check if app div has any content
    const appContent = await page.locator('.app').innerHTML();
    console.log('App div content:', appContent);
    
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
  });
}); 