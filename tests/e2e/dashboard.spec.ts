import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard with welcome screen when no plugins', async ({ page }) => {
    // Check that dashboard is visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Should show welcome screen when no plugins are installed
    await expect(page.getByText('Welcome to NeutralApp')).toBeVisible();
    await expect(page.getByText('Get started by installing your first plugin')).toBeVisible();
    
    // Should show call-to-action button
    await expect(page.getByRole('button', { name: 'Browse Plugins' })).toBeVisible();
  });

  test('should navigate to plugin manager from welcome screen', async ({ page }) => {
    // Click on browse plugins button
    await page.getByRole('button', { name: 'Browse Plugins' }).click();
    
    // Should navigate to plugin manager
    await expect(page).toHaveURL('/plugins');
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should display plugin widgets when plugins are installed', async ({ page }) => {
    // First install a plugin (this would be done via API or test setup)
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate back to dashboard
    await page.goto('/dashboard');
    
    // Should show plugin widgets instead of welcome screen
    await expect(page.getByTestId('widget-container')).toBeVisible();
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Should not show welcome screen
    await expect(page.getByText('Welcome to NeutralApp')).not.toBeVisible();
  });

  test('should handle widget loading states', async ({ page }) => {
    // Install a plugin that takes time to load
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should show loading state for widgets
    await expect(page.getByTestId('widget-loading')).toBeVisible();
    
    // Wait for widgets to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
  });

  test('should handle widget errors gracefully', async ({ page }) => {
    // Install a plugin that fails to load
    await page.goto('/plugins');
    const failingPlugin = page.getByTestId('plugin-card').nth(1);
    await failingPlugin.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should show error state for failed widget
    await expect(page.getByTestId('widget-error')).toBeVisible();
    await expect(page.getByText('Widget failed to load')).toBeVisible();
    
    // Should show retry button
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should retry failed widgets', async ({ page }) => {
    // Install a plugin that fails to load
    await page.goto('/plugins');
    const failingPlugin = page.getByTestId('plugin-card').nth(1);
    await failingPlugin.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click retry button
    await page.getByRole('button', { name: 'Retry' }).click();
    
    // Should show loading state again
    await expect(page.getByTestId('widget-loading')).toBeVisible();
  });

  test('should handle widget interactions', async ({ page }) => {
    // Install a plugin with interactive widget
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Interact with widget (click a button, fill a form, etc.)
    const widget = page.getByTestId('plugin-widget').first();
    await widget.getByRole('button', { name: 'Refresh' }).click();
    
    // Should show interaction feedback
    await expect(page.getByText('Data refreshed')).toBeVisible();
  });

  test('should handle multiple widgets', async ({ page }) => {
    // Install multiple plugins
    await page.goto('/plugins');
    
    // Install first plugin
    const plugin1 = page.getByTestId('plugin-card').first();
    await plugin1.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Install second plugin
    const plugin2 = page.getByTestId('plugin-card').nth(1);
    await plugin2.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should show multiple widgets
    const widgets = page.getByTestId('plugin-widget');
    await expect(widgets).toHaveCount(2);
  });

  test('should handle widget layout changes', async ({ page }) => {
    // Install a plugin
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Click layout settings
    await page.getByRole('button', { name: 'Layout Settings' }).click();
    
    // Should show layout options
    await expect(page.getByText('Widget Layout')).toBeVisible();
    
    // Change widget size
    await page.getByRole('button', { name: 'Large' }).click();
    
    // Should apply layout changes
    await expect(page.getByTestId('plugin-widget')).toHaveClass(/large/);
  });

  test('should handle dashboard refresh', async ({ page }) => {
    // Install a plugin
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Should still show widgets after refresh
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
  });

  test('should handle widget data updates', async ({ page }) => {
    // Install a plugin with real-time data
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Check initial data
    const initialData = await page.getByTestId('widget-data').textContent();
    
    // Trigger data update
    await page.getByRole('button', { name: 'Update Data' }).click();
    
    // Should show updated data
    await expect(page.getByTestId('widget-data')).not.toHaveText(initialData!);
  });

  test('should handle dashboard responsive design', async ({ page }) => {
    // Install a plugin
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should adapt layout for mobile
    await expect(page.getByTestId('widget-container')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Should adapt layout for tablet
    await expect(page.getByTestId('widget-container')).toBeVisible();
  });

  test('should handle dashboard performance with many widgets', async ({ page }) => {
    // Install multiple plugins to test performance
    await page.goto('/plugins');
    
    // Install several plugins
    for (let i = 0; i < 5; i++) {
      const plugin = page.getByTestId('plugin-card').nth(i);
      await plugin.getByRole('button', { name: 'Install' }).click();
      await expect(page.getByText('Installation complete')).toBeVisible();
    }
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should load all widgets within reasonable time
    await expect(page.getByTestId('plugin-widget')).toHaveCount(5);
    
    // Should maintain responsive interactions
    await page.getByRole('button', { name: 'Refresh All' }).click();
    await expect(page.getByText('All widgets refreshed')).toBeVisible();
  });

  test('should handle dashboard accessibility', async ({ page }) => {
    // Install a plugin
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through widgets with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should activate widget interaction
    await expect(page.getByText('Widget activated')).toBeVisible();
  });

  test('should handle dashboard state persistence', async ({ page }) => {
    // Install a plugin
    await page.goto('/plugins');
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for widget to load
    await expect(page.getByTestId('plugin-widget')).toBeVisible();
    
    // Change some dashboard state (layout, settings, etc.)
    await page.getByRole('button', { name: 'Layout Settings' }).click();
    await page.getByRole('button', { name: 'Compact' }).click();
    
    // Navigate away and back
    await page.goto('/settings');
    await page.goto('/dashboard');
    
    // Should restore dashboard state
    await expect(page.getByTestId('plugin-widget')).toHaveClass(/compact/);
  });
}); 