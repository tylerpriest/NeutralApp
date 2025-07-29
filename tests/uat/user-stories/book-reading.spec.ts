/**
 * User Story: Reading a Book
 * As a user
 * I want to read books in a distraction-free environment
 * So that I can focus on the content and enjoy my reading experience
 *
 * Executable Specification: Concrete examples of how the reading system should behave
 * Following SBE/ATDD Core Philosophy: Examples First, Implementation Second
 */

import { test, expect } from '@playwright/test';

test.describe('User Story: Reading a Book', () => {
  test.beforeEach(async ({ page }) => {
    // Set up guest mode for testing
    await page.addInitScript(() => {
      localStorage.setItem('guest_mode', 'true');
      localStorage.removeItem('auth_token');
    });
  });

  test('User can open a book and see the reading interface', async ({ page }) => {
    // Given: User is on the dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // When: User navigates to the reading interface
    await page.goto('/reader/book/demo-book');

    // Then: User sees the reading interface with book content
    await expect(page.getByText('The Art of Programming')).toBeVisible();
    await expect(page.getByText('Jane Developer')).toBeVisible();
    await expect(page.getByText('Chapter 1: The Beginning')).toBeVisible();
    await expect(page.getByText('Welcome to the wonderful world of programming!')).toBeVisible();
  });

  test('User can see reading progress and navigate through content', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User scrolls through the content
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    // Then: Reading progress updates
    await expect(page.locator('[data-testid="reading-progress"]')).toBeVisible();
    
    // And: User can see the progress percentage
    const progressText = await page.locator('[data-testid="progress-percentage"]').textContent();
    expect(progressText).toMatch(/\d+%/);
  });

  test('User can access reading controls and settings', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User moves mouse to show controls
    await page.mouse.move(100, 50);

    // Then: Reading controls become visible
    await expect(page.locator('[data-testid="reading-controls"]')).toBeVisible();
    
    // And: User can see book title and author
    await expect(page.getByText('The Art of Programming')).toBeVisible();
    await expect(page.getByText('Jane Developer')).toBeVisible();
    
    // And: User can access settings
    await expect(page.locator('[data-testid="settings-button"]')).toBeVisible();
  });

  test('User can change reading settings for better experience', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User opens settings
    await page.mouse.move(100, 50);
    await page.click('[data-testid="settings-button"]');

    // Then: Settings panel becomes visible
    await expect(page.locator('[data-testid="reading-settings"]')).toBeVisible();
    
    // And: User can change font size
    await expect(page.locator('[data-testid="font-size-control"]')).toBeVisible();
    
    // And: User can change theme
    await expect(page.locator('[data-testid="theme-control"]')).toBeVisible();
    
    // And: User can change font family
    await expect(page.locator('[data-testid="font-family-control"]')).toBeVisible();
  });

  test('User can add bookmarks while reading', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User adds a bookmark
    await page.mouse.move(100, 50);
    await page.click('[data-testid="bookmark-button"]');

    // Then: Bookmark is added successfully
    await expect(page.locator('[data-testid="bookmark-added"]')).toBeVisible();
    
    // And: User gets confirmation feedback
    await expect(page.getByText('Bookmark added')).toBeVisible();
  });

  test('User can toggle fullscreen mode for immersive reading', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User enters fullscreen mode
    await page.mouse.move(100, 50);
    await page.click('[data-testid="fullscreen-button"]');

    // Then: Reading interface enters fullscreen
    await expect(page.locator('[data-testid="fullscreen-mode"]')).toBeVisible();
    
    // And: Controls are still accessible
    await page.mouse.move(100, 50);
    await expect(page.locator('[data-testid="reading-controls"]')).toBeVisible();
  });

  test('User can return to library from reading interface', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User clicks the library button
    await page.mouse.move(100, 50);
    await page.click('[data-testid="library-button"]');

    // Then: User is taken back to the dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('User sees loading state while book is being prepared', async ({ page }) => {
    // Given: User navigates to a book that takes time to load
    await page.goto('/reader/book/slow-loading-book');

    // When: Page is loading
    // Then: User sees loading indicator
    await expect(page.getByText('Loading book...')).toBeVisible();
    await expect(page.getByText('Preparing your reading experience')).toBeVisible();
  });

  test('User gets appropriate error message for non-existent book', async ({ page }) => {
    // Given: User tries to access a book that doesn't exist
    await page.goto('/reader/book/non-existent-book');

    // When: Page loads
    await page.waitForLoadState('networkidle');

    // Then: User sees error message
    await expect(page.getByText('Book not found')).toBeVisible();
    
    // And: User can go back to library
    await expect(page.getByText('Go Back')).toBeVisible();
  });

  test('User can read with different themes for comfort', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User changes to dark theme
    await page.mouse.move(100, 50);
    await page.click('[data-testid="settings-button"]');
    await page.click('[data-testid="theme-dark"]');

    // Then: Reading interface changes to dark theme
    await expect(page.locator('[data-testid="dark-theme"]')).toBeVisible();
    
    // When: User changes to sepia theme
    await page.click('[data-testid="theme-sepia"]');
    
    // Then: Reading interface changes to sepia theme
    await expect(page.locator('[data-testid="sepia-theme"]')).toBeVisible();
  });

  test('User can adjust text size for better readability', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User increases font size
    await page.mouse.move(100, 50);
    await page.click('[data-testid="settings-button"]');
    await page.click('[data-testid="font-size-increase"]');

    // Then: Text becomes larger
    const textElement = page.locator('[data-testid="reading-content"]');
    const fontSize = await textElement.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThan(18);
  });

  test('User can navigate through book chapters', async ({ page }) => {
    // Given: User is reading a book with multiple chapters
    await page.goto('/reader/book/multi-chapter-book');
    await page.waitForLoadState('networkidle');

    // When: User navigates to next chapter
    await page.mouse.move(100, 50);
    await page.click('[data-testid="next-chapter"]');

    // Then: User sees the next chapter content
    await expect(page.getByText('Chapter 2: Advanced Concepts')).toBeVisible();
    
    // When: User navigates to previous chapter
    await page.click('[data-testid="prev-chapter"]');
    
    // Then: User sees the previous chapter content
    await expect(page.getByText('Chapter 1: The Beginning')).toBeVisible();
  });

  test('User reading progress is automatically saved', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User scrolls to a new position
    await page.evaluate(() => {
      window.scrollTo(0, 1000);
    });

    // And: User refreshes the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Then: User returns to their previous reading position
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
  });

  test('User can search within the book content', async ({ page }) => {
    // Given: User is reading a book
    await page.goto('/reader/book/demo-book');
    await page.waitForLoadState('networkidle');

    // When: User opens search
    await page.mouse.move(100, 50);
    await page.click('[data-testid="search-button"]');

    // Then: Search interface becomes visible
    await expect(page.locator('[data-testid="search-interface"]')).toBeVisible();
    
    // When: User searches for a term
    await page.fill('[data-testid="search-input"]', 'programming');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Then: Search results are highlighted
    await expect(page.locator('[data-testid="search-highlight"]')).toBeVisible();
  });
}); 