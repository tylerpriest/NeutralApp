/**
 * User Story: Basic Navigation
 * As a user
 * I want to navigate between pages
 * So that I can access different features of the application
 * 
 * Executable Specification: Concrete examples of how the system should behave
 * Following SBE/ATDD Core Philosophy: Examples First, Implementation Second
 */

import { test, expect } from '@playwright/test';

test.describe('User Story: Basic Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up guest mode for testing
    await page.addInitScript(() => {
      localStorage.setItem('guest_mode', 'true');
      localStorage.removeItem('auth_token');
    });
  });

  test('User can navigate to dashboard and see welcome screen', async ({ page }) => {
    // Given: User is on the application
    await page.goto('/dashboard');

    // When: Page loads
    await page.waitForLoadState('networkidle');

    // Then: User sees welcome screen
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByText('Get started by installing your first plugin')).toBeVisible();
  });

  test('User can navigate to plugin manager page', async ({ page }) => {
    // Given: User is on dashboard
    await page.goto('/dashboard');
    
    // When: User clicks on browse plugins button
    await page.click('[data-testid="browse-plugins"]');
    
    // Then: User is taken to plugin manager
    await expect(page).toHaveURL('/plugins');
    await expect(page.getByText('Plugin Manager')).toBeVisible();
  });

  test('User can navigate to settings page', async ({ page }) => {
    // Given: User is on dashboard
    await page.goto('/dashboard');
    
    // When: User clicks on settings link
    await page.click('[data-testid="settings-link"]');
    
    // Then: User is taken to settings page
    await expect(page).toHaveURL('/settings');
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('User can navigate to admin page', async ({ page }) => {
    // Given: User is on dashboard
    await page.goto('/dashboard');
    
    // When: User clicks on admin link
    await page.click('[data-testid="admin-link"]');
    
    // Then: User is taken to admin page
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText('Admin')).toBeVisible();
  });
}); 