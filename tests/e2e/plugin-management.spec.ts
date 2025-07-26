import { test, expect } from '@playwright/test';

test.describe('Plugin Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to plugin manager
    await page.goto('/plugins');
    await expect(page).toHaveURL('/plugins');
  });

  test('should display plugin marketplace', async ({ page }) => {
    // Check that plugin marketplace is visible
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    
    // Check for plugin grid
    await expect(page.getByTestId('plugin-grid')).toBeVisible();
    
    // Check for search functionality
    await expect(page.getByPlaceholder('Search plugins...')).toBeVisible();
    
    // Check for filter options
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
  });

  test('should display plugin cards with information', async ({ page }) => {
    // Check that plugin cards are displayed
    const pluginCards = page.getByTestId('plugin-card');
    await expect(pluginCards.first()).toBeVisible();
    
    // Check for plugin information
    await expect(pluginCards.first().getByTestId('plugin-name')).toBeVisible();
    await expect(pluginCards.first().getByTestId('plugin-description')).toBeVisible();
    await expect(pluginCards.first().getByTestId('plugin-rating')).toBeVisible();
    await expect(pluginCards.first().getByTestId('plugin-author')).toBeVisible();
  });

  test('should search for plugins', async ({ page }) => {
    // Search for a specific plugin
    await page.getByPlaceholder('Search plugins...').fill('productivity');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Check that search results are filtered
    const pluginCards = page.getByTestId('plugin-card');
    await expect(pluginCards).toHaveCount(1);
    
    // Check that the filtered plugin contains the search term
    await expect(pluginCards.first().getByTestId('plugin-name')).toContainText('productivity', { ignoreCase: true });
  });

  test('should filter plugins by category', async ({ page }) => {
    // Open filter dropdown
    await page.getByRole('button', { name: 'Filter' }).click();
    
    // Select productivity category
    await page.getByRole('option', { name: 'Productivity' }).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that only productivity plugins are shown
    const pluginCards = page.getByTestId('plugin-card');
    await expect(pluginCards).toHaveCount(1);
  });

  test('should install a plugin', async ({ page }) => {
    // Find the first available plugin
    const pluginCard = page.getByTestId('plugin-card').first();
    const pluginName = await pluginCard.getByTestId('plugin-name').textContent();
    
    // Click install button
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    
    // Should show installation progress
    await expect(page.getByText('Installing...')).toBeVisible();
    
    // Wait for installation to complete
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Should show installed plugins section
    await expect(page.getByRole('heading', { name: 'Installed Plugins' })).toBeVisible();
    
    // Should show the installed plugin
    await expect(page.getByText(pluginName!)).toBeVisible();
  });

  test('should enable/disable installed plugin', async ({ page }) => {
    // First install a plugin
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Find the installed plugin
    const installedPlugin = page.getByTestId('installed-plugin').first();
    
    // Check that plugin is enabled by default
    await expect(installedPlugin.getByRole('switch')).toBeChecked();
    
    // Disable the plugin
    await installedPlugin.getByRole('switch').click();
    
    // Should show disabled state
    await expect(installedPlugin.getByRole('switch')).not.toBeChecked();
    
    // Should show disabled indicator
    await expect(installedPlugin.getByText('Disabled')).toBeVisible();
    
    // Enable the plugin again
    await installedPlugin.getByRole('switch').click();
    
    // Should show enabled state
    await expect(installedPlugin.getByRole('switch')).toBeChecked();
  });

  test('should uninstall a plugin', async ({ page }) => {
    // First install a plugin
    const pluginCard = page.getByTestId('plugin-card').first();
    const pluginName = await pluginCard.getByTestId('plugin-name').textContent();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Find the installed plugin
    const installedPlugin = page.getByTestId('installed-plugin').first();
    
    // Click uninstall button
    await installedPlugin.getByRole('button', { name: 'Uninstall' }).click();
    
    // Should show confirmation dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Are you sure you want to uninstall this plugin?')).toBeVisible();
    
    // Confirm uninstall
    await page.getByRole('button', { name: 'Uninstall' }).click();
    
    // Should show uninstallation progress
    await expect(page.getByText('Uninstalling...')).toBeVisible();
    
    // Wait for uninstallation to complete
    await expect(page.getByText('Plugin uninstalled successfully')).toBeVisible();
    
    // Should remove plugin from installed list
    await expect(page.getByText(pluginName!)).not.toBeVisible();
  });

  test('should cancel plugin uninstallation', async ({ page }) => {
    // First install a plugin
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Find the installed plugin
    const installedPlugin = page.getByTestId('installed-plugin').first();
    
    // Click uninstall button
    await installedPlugin.getByRole('button', { name: 'Uninstall' }).click();
    
    // Should show confirmation dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Cancel uninstall
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Should close dialog
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Plugin should still be installed
    await expect(installedPlugin).toBeVisible();
  });

  test('should view plugin details', async ({ page }) => {
    // Click on a plugin card to view details
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.click();
    
    // Should show plugin details modal/page
    await expect(page.getByTestId('plugin-details')).toBeVisible();
    
    // Should show detailed information
    await expect(page.getByTestId('plugin-full-description')).toBeVisible();
    await expect(page.getByTestId('plugin-version')).toBeVisible();
    await expect(page.getByTestId('plugin-dependencies')).toBeVisible();
    await expect(page.getByTestId('plugin-changelog')).toBeVisible();
  });

  test('should handle plugin installation errors', async ({ page }) => {
    // Mock a plugin that fails to install
    const failingPlugin = page.getByTestId('plugin-card').nth(1);
    
    // Click install button
    await failingPlugin.getByRole('button', { name: 'Install' }).click();
    
    // Should show installation progress
    await expect(page.getByText('Installing...')).toBeVisible();
    
    // Should show error message
    await expect(page.getByText('Installation failed')).toBeVisible();
    await expect(page.getByText('Please try again or contact support')).toBeVisible();
    
    // Should show retry button
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should handle plugin dependency conflicts', async ({ page }) => {
    // Install a plugin with dependencies
    const pluginWithDeps = page.getByTestId('plugin-card').nth(2);
    await pluginWithDeps.getByRole('button', { name: 'Install' }).click();
    
    // Should show dependency resolution
    await expect(page.getByText('Resolving dependencies...')).toBeVisible();
    
    // Should show dependency information
    await expect(page.getByText('This plugin requires:')).toBeVisible();
    
    // Should show install dependencies button
    await expect(page.getByRole('button', { name: 'Install Dependencies' })).toBeVisible();
  });

  test('should update installed plugins', async ({ page }) => {
    // First install a plugin
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.getByRole('button', { name: 'Install' }).click();
    await expect(page.getByText('Installation complete')).toBeVisible();
    
    // Find the installed plugin
    const installedPlugin = page.getByTestId('installed-plugin').first();
    
    // Check for update available
    await expect(installedPlugin.getByText('Update available')).toBeVisible();
    
    // Click update button
    await installedPlugin.getByRole('button', { name: 'Update' }).click();
    
    // Should show update progress
    await expect(page.getByText('Updating...')).toBeVisible();
    
    // Wait for update to complete
    await expect(page.getByText('Update complete')).toBeVisible();
  });

  test('should handle plugin ratings and reviews', async ({ page }) => {
    // Click on a plugin card to view details
    const pluginCard = page.getByTestId('plugin-card').first();
    await pluginCard.click();
    
    // Should show ratings section
    await expect(page.getByTestId('plugin-ratings')).toBeVisible();
    
    // Should show average rating
    await expect(page.getByTestId('average-rating')).toBeVisible();
    
    // Should show review count
    await expect(page.getByTestId('review-count')).toBeVisible();
    
    // Should show individual reviews
    await expect(page.getByTestId('review-item')).toBeVisible();
  });

  test('should handle plugin categories and tags', async ({ page }) => {
    // Check that category filter works
    await page.getByRole('button', { name: 'Filter' }).click();
    
    // Should show different categories
    await expect(page.getByRole('option', { name: 'Productivity' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Development' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Design' })).toBeVisible();
    
    // Select a category
    await page.getByRole('option', { name: 'Development' }).click();
    
    // Should filter plugins by category
    const pluginCards = page.getByTestId('plugin-card');
    await expect(pluginCards).toHaveCount(1);
  });

  test('should handle plugin search with special characters', async ({ page }) => {
    // Search with special characters
    await page.getByPlaceholder('Search plugins...').fill('test-plugin@1.0');
    
    // Should handle special characters gracefully
    await page.waitForTimeout(500);
    
    // Should show appropriate results or no results message
    const pluginCards = page.getByTestId('plugin-card');
    if (await pluginCards.count() === 0) {
      await expect(page.getByText('No plugins found')).toBeVisible();
    }
  });

  test('should handle plugin manager pagination', async ({ page }) => {
    // Check if pagination is present (if there are many plugins)
    const pagination = page.getByTestId('pagination');
    
    if (await pagination.isVisible()) {
      // Click next page
      await pagination.getByRole('button', { name: 'Next' }).click();
      
      // Should show different plugins
      const pluginCards = page.getByTestId('plugin-card');
      await expect(pluginCards).toBeVisible();
      
      // Click previous page
      await pagination.getByRole('button', { name: 'Previous' }).click();
      
      // Should return to first page
      await expect(page.getByTestId('plugin-card').first()).toBeVisible();
    }
  });
}); 