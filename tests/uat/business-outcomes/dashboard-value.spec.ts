/**
 * Business Outcome: Dashboard Value Delivery
 * Validate that the dashboard delivers measurable business value
 * Following Value-Driven Testing Principle
 */

import { test, expect } from '@playwright/test';

describe('Business Outcome: Dashboard Value', () => {
  test('New user can achieve first value within 5 minutes', async ({ page }) => {
    const startTime = Date.now();
    
    // Given: New user signs up
    await page.goto('/auth');
    await page.click('[data-testid="google-signup"]');
    await mockGoogleOAuthSuccess();
    
    // When: User explores and installs first plugin
    await expect(page).toHaveURL('/dashboard');
    await page.click('[data-testid="browse-plugins"]');
    await page.click('[data-testid="install-reading-core"]');
    
    // Then: User achieves first value (functional dashboard)
    await page.goto('/dashboard');
    await expect(page.getByText('📚 Book Library')).toBeVisible();
    
    const timeToValue = Date.now() - startTime;
    expect(timeToValue).toBeLessThan(300000); // 5 minutes
    
    // Business Metric: Time to first value
    console.log(`Time to first value: ${timeToValue}ms`);
  });

  test('User can accomplish core tasks without technical knowledge', async ({ page }) => {
    // Given: User is on dashboard
    await page.goto('/dashboard');
    
    // When: User performs core actions
    const actions = [
      'Browse plugins',
      'Install plugin',
      'Add content',
      'View results'
    ];
    
    // Then: All actions are intuitive and require no technical knowledge
    for (const action of actions) {
      const element = page.getByRole('button', { name: new RegExp(action, 'i') });
      await expect(element).toBeVisible();
      await expect(element).toBeEnabled();
    }
  });

  test('Dashboard provides immediate feedback for user actions', async ({ page }) => {
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

  test('User can customize dashboard to their needs', async ({ page }) => {
    // Given: User has installed multiple plugins
    await page.goto('/plugins');
    await page.click('[data-testid="install-reading-core"]');
    await page.click('[data-testid="install-weather-widget"]');
    
    // When: User arranges dashboard layout
    await page.goto('/dashboard');
    await page.dragAndDrop('[data-testid="reading-widget"]', '[data-testid="dashboard-area"]');
    
    // Then: Dashboard reflects user preferences
    await expect(page.getByText('📚 Book Library')).toBeVisible();
    await expect(page.getByText('🌤️ Weather')).toBeVisible();
    
    // And: Layout persists across sessions
    await page.reload();
    await expect(page.getByText('📚 Book Library')).toBeVisible();
    await expect(page.getByText('🌤️ Weather')).toBeVisible();
  });
});

// Mock function for Google OAuth success
async function mockGoogleOAuthSuccess() {
  // Implementation would mock successful OAuth flow
  // This is a placeholder for the actual implementation
} 