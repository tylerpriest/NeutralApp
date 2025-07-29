/**
 * Executable Specifications: Concrete examples of how the system should behave
 * Following SBE/ATDD Core Philosophy
 */

import { test, expect } from '@playwright/test';

test.describe('Executable Specifications: System Behavior', () => {
  test('System provides immediate feedback for user actions', async ({ page }) => {
    // Given: User performs an action
    await page.goto('/dashboard');
    await page.click('[data-testid="add-content"]');
    
    // When: Action is processed
    await page.fill('[data-testid="content-title"]', 'Test Content');
    await page.click('[data-testid="save-content"]');
    
    // Then: User receives immediate feedback
    await expect(page.getByText('Content saved successfully')).toBeVisible();
    await expect(page.getByText('Test Content')).toBeVisible();
    
    // And: System state is updated
    await expect(page.getByText('1 item in library')).toBeVisible();
  });

  test('System handles errors gracefully with user-friendly messages', async ({ page }) => {
    // Given: System encounters an error
    await page.route('/api/content/save', route => 
      route.fulfill({ status: 500, body: 'Internal server error' })
    );
    
    // When: User attempts to save content
    await page.goto('/dashboard');
    await page.click('[data-testid="add-content"]');
    await page.fill('[data-testid="content-title"]', 'Test Content');
    await page.click('[data-testid="save-content"]');
    
    // Then: User sees helpful error message
    await expect(page.getByText('Unable to save content')).toBeVisible();
    await expect(page.getByText('Please try again in a moment')).toBeVisible();
    
    // And: User has clear recovery path
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('System maintains user state across navigation', async ({ page }) => {
    // Given: User has added content
    await page.goto('/dashboard');
    await page.click('[data-testid="add-content"]');
    await page.fill('[data-testid="content-title"]', 'Persistent Content');
    await page.click('[data-testid="save-content"]');
    
    // When: User navigates away and returns
    await page.goto('/plugins');
    await page.goto('/dashboard');
    
    // Then: User's content is still visible
    await expect(page.getByText('Persistent Content')).toBeVisible();
    await expect(page.getByText('1 item in library')).toBeVisible();
  });

  test('System provides clear loading states', async ({ page }) => {
    // Given: User performs an action that takes time
    await page.route('/api/plugins/install', route => 
      new Promise(resolve => setTimeout(() => resolve(route.fulfill({ status: 200, body: '{}' })), 2000))
    );
    
    // When: User installs a plugin
    await page.goto('/plugins');
    await page.click('[data-testid="install-reading-core"]');
    
    // Then: User sees loading indicator
    await expect(page.getByText('Installing plugin...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Install' })).toBeDisabled();
    
    // And: Loading state clears when complete
    await expect(page.getByText('Plugin installed successfully')).toBeVisible();
  });

  test('System validates user input and provides helpful feedback', async ({ page }) => {
    // Given: User enters invalid data
    await page.goto('/dashboard');
    await page.click('[data-testid="add-content"]');
    
    // When: User tries to save without required fields
    await page.click('[data-testid="save-content"]');
    
    // Then: System shows validation errors
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Please enter a valid title')).toBeVisible();
    
    // And: Form remains in edit mode
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  test('System provides keyboard navigation support', async ({ page }) => {
    // Given: User navigates with keyboard
    await page.goto('/dashboard');
    
    // When: User uses Tab to navigate
    await page.keyboard.press('Tab');
    
    // Then: Focus moves to first interactive element
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'browse-plugins');
    
    // And: User can navigate through all interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'settings-button');
  });
}); 