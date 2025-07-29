import { test, expect } from '@playwright/test';

test.describe('Reading Plugin Customer Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete and redirect
    await page.waitForTimeout(3000);
  });

  test.describe('Plugin Installation Journey', () => {
    test('should install reading plugin and see widgets on dashboard', async ({ page }) => {
      // Navigate to plugin manager
      await page.goto('/plugins');
      await page.waitForLoadState('networkidle');

      // Install reading-core plugin
      const installButton = page.getByRole('button', { name: /install.*reading.*core/i });
      await expect(installButton).toBeVisible();
      await installButton.click();

      // Wait for installation
      await page.waitForTimeout(2000);

      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should see reading widgets
      await expect(page.getByText('📚 Book Library')).toBeVisible();
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();

      // Should show library statistics
      await expect(page.getByText(/Total Books/)).toBeVisible();
      await expect(page.getByText(/Completed Books/)).toBeVisible();
      await expect(page.getByText(/In Progress Books/)).toBeVisible();
    });

    test('should see reading sidebar navigation after plugin installation', async ({ page }) => {
      // Install plugin first (simplified for test)
      await page.goto('/plugins');
      await page.waitForLoadState('networkidle');
      
      const installButton = page.getByRole('button', { name: /install.*reading.*core/i });
      if (await installButton.isVisible()) {
        await installButton.click();
        await page.waitForTimeout(2000);
      }

      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should see reading sidebar section
      await expect(page.getByText('📚 Reader')).toBeVisible();

      // Expand reading sidebar
      const readerSection = page.getByText('📚 Reader');
      await readerSection.click();

      // Should see reading navigation items
      await expect(page.getByText('📖 Library')).toBeVisible();
      await expect(page.getByText('📄 Currently Reading')).toBeVisible();
      await expect(page.getByText('🔖 Bookmarks')).toBeVisible();
      await expect(page.getByText('📝 Notes')).toBeVisible();
      await expect(page.getByText('📥 Import Books')).toBeVisible();
      await expect(page.getByText('⚙️ Reading Settings')).toBeVisible();
    });
  });

  test.describe('Library Management Journey', () => {
    test('should add books and see them in library', async ({ page }) => {
      // Navigate to library
      await page.goto('/reader/library');
      await page.waitForLoadState('networkidle');

      // Should see add book button
      await expect(page.getByRole('button', { name: /add book/i })).toBeVisible();

      // Click add book
      await page.getByRole('button', { name: /add book/i }).click();

      // Should navigate to import page
      await expect(page).toHaveURL('/reader/import');
      await expect(page.getByText(/import books/i)).toBeVisible();
    });

    test('should search and filter books', async ({ page }) => {
      // Navigate to library
      await page.goto('/reader/library');
      await page.waitForLoadState('networkidle');

      // Should see search functionality
      const searchInput = page.getByPlaceholder(/search books/i);
      await expect(searchInput).toBeVisible();

      // Test search
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Should show search results or no results message
      const results = page.locator('[data-testid="book-item"], .book-item');
      const resultCount = await results.count();
      
      if (resultCount > 0) {
        await expect(results.first()).toBeVisible();
      } else {
        await expect(page.getByText(/no books found/i)).toBeVisible();
      }
    });

    test('should view book details and start reading', async ({ page }) => {
      // Navigate to library
      await page.goto('/reader/library');
      await page.waitForLoadState('networkidle');

      // Look for any book to click on
      const bookItems = page.locator('[data-testid="book-item"], .book-item, .book-card');
      const bookCount = await bookItems.count();

      if (bookCount > 0) {
        // Click on first book
        await bookItems.first().click();

        // Should navigate to reading interface
        await expect(page).toHaveURL(/\/reader\/book\//);
        await expect(page.getByText(/reading interface/i)).toBeVisible();
      } else {
        // If no books, test the empty state
        await expect(page.getByText(/no books in library/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /add your first book/i })).toBeVisible();
      }
    });
  });

  test.describe('Reading Experience Journey', () => {
    test('should open reading interface and see controls', async ({ page }) => {
      // Navigate directly to reading interface (with mock book)
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');

      // Should see reading interface
      await expect(page.getByText(/reading interface/i)).toBeVisible();

      // Should see reading controls
      await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /bookmark/i })).toBeVisible();
    });

    test('should access reading settings and customize experience', async ({ page }) => {
      // Navigate to reading interface
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();

      // Should see settings panel
      await expect(page.getByText('Reading Settings')).toBeVisible();
      await expect(page.getByText('Font Size')).toBeVisible();
      await expect(page.getByText('Font Family')).toBeVisible();
      await expect(page.getByText('Line Height')).toBeVisible();
      await expect(page.getByText('Theme')).toBeVisible();

      // Test font size change
      const fontSizeInput = page.getByLabel(/font size/i);
      await fontSizeInput.fill('20');
      await expect(fontSizeInput).toHaveValue('20');

      // Test theme change
      const themeSelect = page.getByLabel(/theme/i);
      await themeSelect.selectOption('dark');
      await expect(themeSelect).toHaveValue('dark');
    });

    test('should add bookmarks and track progress', async ({ page }) => {
      // Navigate to reading interface
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');

      // Add bookmark
      await page.getByRole('button', { name: /bookmark/i }).click();

      // Should show bookmark added feedback
      await expect(page.getByText(/bookmark added/i)).toBeVisible();

      // Navigate to bookmarks page
      await page.goto('/reader/bookmarks');
      await page.waitForLoadState('networkidle');

      // Should see bookmark
      await expect(page.getByText(/bookmarks/i)).toBeVisible();
    });

    test('should navigate through reading content', async ({ page }) => {
      // Navigate to reading interface
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');

      // Test next page navigation
      await page.getByRole('button', { name: /next/i }).click();
      
      // Should update progress
      await expect(page.getByText(/progress/i)).toBeVisible();

      // Test previous page navigation
      await page.getByRole('button', { name: /previous/i }).click();
      
      // Should update progress
      await expect(page.getByText(/progress/i)).toBeVisible();
    });
  });

  test.describe('Recently Read Widget Journey', () => {
    test('should see recently read books on dashboard', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should see recently read widget
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();

      // Should show recent books or empty state
      const recentBooks = page.locator('[data-testid="recent-book"], .recent-book');
      const bookCount = await recentBooks.count();

      if (bookCount > 0) {
        await expect(recentBooks.first()).toBeVisible();
        
        // Test resume reading
        const resumeButton = page.getByRole('button', { name: /resume|continue|re-read/i });
        if (await resumeButton.isVisible()) {
          await resumeButton.first().click();
          await expect(page).toHaveURL(/\/reader\/book\//);
        }
      } else {
        await expect(page.getByText(/no recent reading activity/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /browse library/i })).toBeVisible();
      }
    });

    test('should navigate to library from recently read widget', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Click browse library from empty state
      const browseButton = page.getByRole('button', { name: /browse library/i });
      if (await browseButton.isVisible()) {
        await browseButton.click();
        await expect(page).toHaveURL('/reader/library');
      }
    });
  });

  test.describe('Sidebar Navigation Journey', () => {
    test('should navigate through reading sidebar sections', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Click on reading sidebar items
      const sidebarItems = [
        { text: '📖 Library', url: '/reader/library' },
        { text: '📄 Currently Reading', url: '/reader/current' },
        { text: '🔖 Bookmarks', url: '/reader/bookmarks' },
        { text: '📝 Notes', url: '/reader/notes' },
        { text: '📥 Import Books', url: '/reader/import' },
        { text: '⚙️ Reading Settings', url: '/reader/settings' }
      ];

      for (const item of sidebarItems) {
        // Try to find and click the sidebar item
        const sidebarItem = page.getByText(item.text);
        if (await sidebarItem.isVisible()) {
          await sidebarItem.click();
          await page.waitForLoadState('networkidle');
          
          // Should navigate to correct page
          await expect(page).toHaveURL(item.url);
          
          // Go back to dashboard for next test
          await page.goto('/dashboard');
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('Error Handling Journey', () => {
    test('should handle missing reading plugin gracefully', async ({ page }) => {
      // Navigate to dashboard without reading plugin
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should not crash and should show appropriate state
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should handle reading interface errors gracefully', async ({ page }) => {
      // Navigate to non-existent book
      await page.goto('/reader/book/non-existent-book');
      await page.waitForLoadState('networkidle');

      // Should show error state or fallback content
      await expect(page.getByText(/error|not found|fallback/i)).toBeVisible();
    });
  });

  test.describe('Responsive Design Journey', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should see reading widgets in mobile layout
      await expect(page.getByText('📚 Book Library')).toBeVisible();
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();

      // Navigate to reading interface
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');

      // Should see mobile-optimized reading interface
      await expect(page.getByText(/reading interface/i)).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should see reading widgets in tablet layout
      await expect(page.getByText('📚 Book Library')).toBeVisible();
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();

      // Navigate to library
      await page.goto('/reader/library');
      await page.waitForLoadState('networkidle');

      // Should see tablet-optimized library interface
      await expect(page.getByText(/library/i)).toBeVisible();
    });
  });

  test.describe('Performance Journey', () => {
    test('should load reading widgets quickly', async ({ page }) => {
      const startTime = Date.now();

      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Should see reading widgets
      await expect(page.getByText('📚 Book Library')).toBeVisible();
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();
    });

    test('should load reading interface quickly', async ({ page }) => {
      const startTime = Date.now();

      // Navigate to reading interface
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Should see reading interface
      await expect(page.getByText(/reading interface/i)).toBeVisible();
    });
  });

  test.describe('Complete User Journey', () => {
    test('should complete full reading plugin journey', async ({ page }) => {
      // Step 1: Install reading plugin
      await page.goto('/plugins');
      await page.waitForLoadState('networkidle');
      
      const installButton = page.getByRole('button', { name: /install.*reading.*core/i });
      if (await installButton.isVisible()) {
        await installButton.click();
        await page.waitForTimeout(2000);
      }

      // Step 2: Navigate to dashboard and see widgets
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('📚 Book Library')).toBeVisible();
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();

      // Step 3: Navigate to library
      await page.getByRole('button', { name: /view all/i }).click();
      await expect(page).toHaveURL('/reader/library');

      // Step 4: Add a book
      await page.getByRole('button', { name: /add book/i }).click();
      await expect(page).toHaveURL('/reader/import');

      // Step 5: Navigate to reading interface
      await page.goto('/reader/book/test-book-1');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/reading interface/i)).toBeVisible();

      // Step 6: Customize reading settings
      await page.getByRole('button', { name: /settings/i }).click();
      await expect(page.getByText('Reading Settings')).toBeVisible();

      // Step 7: Add bookmark
      await page.getByRole('button', { name: /bookmark/i }).click();
      await expect(page.getByText(/bookmark added/i)).toBeVisible();

      // Step 8: Navigate through sidebar
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const sidebarItem = page.getByText('📖 Library');
      if (await sidebarItem.isVisible()) {
        await sidebarItem.click();
        await expect(page).toHaveURL('/reader/library');
      }

      // Step 9: Return to dashboard and see updated widgets
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('📚 Book Library')).toBeVisible();
      await expect(page.getByText('🕒 Recently Read')).toBeVisible();

      // Journey completed successfully
      console.log('✅ Complete reading plugin journey completed successfully');
    });
  });
}); 