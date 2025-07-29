import { test, expect } from '@playwright/test';

test.describe('Reading Plugin Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the installed plugins to include reading-core
    await page.addInitScript(() => {
      localStorage.setItem('installed_plugins', JSON.stringify([
        {
          id: 'reading-core',
          name: 'Reading Core',
          description: 'Book library management with metadata handling and search',
          version: '1.0.0',
          author: 'NeutralApp Team',
          enabled: true,
          category: 'reading',
          tags: ['reading', 'books', 'library']
        }
      ]));
    });

    await page.goto('/');
  });

  test('should display reading widgets on dashboard when plugin is enabled', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=Dashboard');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Dashboard');
    
    // Check that reading widgets are displayed
    await expect(page.locator('text=Book Library')).toBeVisible();
    await expect(page.locator('text=Recently Read')).toBeVisible();
    
    // Check that widgets have proper content
    await expect(page.locator('text=No books in library')).toBeVisible();
    await expect(page.locator('text=No recent reading activity')).toBeVisible();
  });

  test('should display reading navigation in sidebar', async ({ page }) => {
    // Check that reading sidebar items are present
    await expect(page.locator('text=📚 Reader')).toBeVisible();
    
    // Expand the reading pack if collapsed
    const readerPack = page.locator('text=📚 Reader').first();
    await readerPack.click();
    
    // Check that reading navigation items are visible
    await expect(page.locator('text=📖 Library')).toBeVisible();
    await expect(page.locator('text=📄 Currently Reading')).toBeVisible();
    await expect(page.locator('text=🔖 Bookmarks')).toBeVisible();
    await expect(page.locator('text=📝 Notes')).toBeVisible();
    await expect(page.locator('text=📥 Import Books')).toBeVisible();
    await expect(page.locator('text=⚙️ Reading Settings')).toBeVisible();
  });

  test('should navigate to reading pages from sidebar', async ({ page }) => {
    // Expand the reading pack
    const readerPack = page.locator('text=📚 Reader').first();
    await readerPack.click();
    
    // Click on Library
    await page.click('text=📖 Library');
    await page.waitForURL('**/reader/library');
    
    // Should be on library page
    await expect(page.locator('text=Library')).toBeVisible();
  });

  test('should navigate to reading pages from dashboard widgets', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=Dashboard');
    await page.waitForSelector('text=Dashboard');
    
    // Click "View All Books" in the library widget
    await page.click('text=View All Books →');
    await page.waitForURL('**/reader/library');
    
    // Should be on library page
    await expect(page.locator('text=Library')).toBeVisible();
  });

  test('should handle reading plugin API integration', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=Dashboard');
    await page.waitForSelector('text=Dashboard');
    
    // Check that widgets are properly connected to plugin API
    // The widgets should show empty states when no books are in the library
    await expect(page.locator('text=No books in library')).toBeVisible();
    await expect(page.locator('text=Start reading to see your progress here')).toBeVisible();
  });
}); 