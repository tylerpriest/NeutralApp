/**
 * User Story: Plugin Installation
 * As a user
 * I want to discover and install plugins
 * So that I can extend the functionality of my dashboard
 * 
 * Executable Specification: Concrete examples of how the system should behave
 * Following SBE/ATDD Core Philosophy: Examples First, Implementation Second
 */

import { test, expect } from '@playwright/test';

test.describe('User Story: Plugin Installation', () => {
  test('User can discover, install, and immediately use a plugin', async ({ page }) => {
    // Given: User is on dashboard and wants to add functionality
    await page.goto('/dashboard');
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    
    // When: User discovers and installs a reading plugin
    await page.click('[data-testid="browse-plugins"]');
    await expect(page).toHaveURL('/plugins');
    
    await page.click('[data-testid="install-reading-core"]');
    await expect(page.getByText('Plugin installed successfully')).toBeVisible();
    
    // Then: User can immediately use the new functionality
    await page.goto('/dashboard');
    await expect(page.getByText('📚 Book Library')).toBeVisible();
    await expect(page.getByText('🕒 Recently Read')).toBeVisible();
    
    // And: User can perform the core action
    await page.click('[data-testid="add-book"]');
    await page.fill('[data-testid="book-title"]', 'Test Book');
    await page.click('[data-testid="save-book"]');
    await expect(page.getByText('Test Book')).toBeVisible();
    
    // Business Outcome: User has successfully extended their dashboard
    await expect(page.getByText('1 book in library')).toBeVisible();
  });

  test('User gets clear feedback when plugin installation fails', async ({ page }) => {
    // Given: User attempts to install a plugin
    await page.goto('/plugins');
    
    // When: Installation fails due to network issues (real-world condition)
    await page.route('/api/plugins/install', route => 
      route.fulfill({ status: 500, body: 'Server error' })
    );
    
    await page.click('[data-testid="install-reading-core"]');
    
    // Then: User sees helpful error message
    await expect(page.getByText('Unable to install plugin')).toBeVisible();
    await expect(page.getByText('Please check your connection and try again')).toBeVisible();
    
    // And: User has clear path to recovery
    await expect(page.getByRole('button', { name: 'Retry Installation' })).toBeVisible();
  });

  test('User can uninstall plugins and dashboard updates accordingly', async ({ page }) => {
    // Given: User has installed a plugin
    await page.goto('/dashboard');
    await page.click('[data-testid="browse-plugins"]');
    await page.click('[data-testid="install-reading-core"]');
    await expect(page.getByText('Plugin installed successfully')).toBeVisible();
    
    // When: User uninstalls the plugin
    await page.goto('/plugins');
    await page.click('[data-testid="uninstall-reading-core"]');
    await expect(page.getByText('Plugin uninstalled successfully')).toBeVisible();
    
    // Then: Dashboard updates to show welcome screen
    await page.goto('/dashboard');
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByText('Get started by installing your first plugin')).toBeVisible();
    
    // And: Plugin widgets are no longer visible
    await expect(page.getByText('📚 Book Library')).not.toBeVisible();
  });
}); 