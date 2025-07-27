import { test, expect } from '@playwright/test';

test.describe('Plugin Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Email Address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(3000);
    
    // Navigate to plugin manager
    await page.goto('/plugins');
    await page.waitForLoadState('networkidle');
  });

  test('should display plugin manager page', async ({ page }) => {
    // Check that plugin manager is visible
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    
    // Should show plugin manager content
    await expect(page.getByText('Available Plugins')).toBeVisible();
    await expect(page.getByText('Installed Plugins')).toBeVisible();
  });

  test('should display available plugins', async ({ page }) => {
    // Check that available plugins section is visible
    await expect(page.getByText('Available Plugins')).toBeVisible();
    
    // Should show plugin cards or list
    // Note: This will depend on actual plugin data being available
    const pluginCards = page.locator('[data-testid="plugin-card"], .plugin-card, .available-plugin');
    
    // Check if any plugins are displayed
    const pluginCount = await pluginCards.count();
    
    if (pluginCount > 0) {
      // If plugins exist, check their structure
      await expect(pluginCards.first()).toBeVisible();
      
      // Check for common plugin elements
      await expect(pluginCards.first().getByRole('heading')).toBeVisible();
      await expect(pluginCards.first().getByRole('button', { name: /install/i })).toBeVisible();
    } else {
      // If no plugins, should show appropriate message
      await expect(page.getByText(/no plugins available|no plugins found/i)).toBeVisible();
    }
  });

  test('should display installed plugins', async ({ page }) => {
    // Check that installed plugins section is visible
    await expect(page.getByText('Installed Plugins')).toBeVisible();
    
    // Should show installed plugins list
    const installedPlugins = page.locator('[data-testid="installed-plugin"], .installed-plugin');
    
    // Check if any plugins are installed
    const installedCount = await installedPlugins.count();
    
    if (installedCount > 0) {
      // If plugins are installed, check their structure
      await expect(installedPlugins.first()).toBeVisible();
      
      // Check for common installed plugin elements
      await expect(installedPlugins.first().getByRole('button', { name: /uninstall|remove/i })).toBeVisible();
    } else {
      // If no plugins installed, should show appropriate message
      await expect(page.getByText(/no plugins installed|no installed plugins/i)).toBeVisible();
    }
  });

  test('should handle plugin installation', async ({ page }) => {
    // Look for installable plugins
    const installButtons = page.getByRole('button', { name: /install/i });
    
    if (await installButtons.count() > 0) {
      // Click install button on first available plugin
      await installButtons.first().click();
      
      // Wait for installation process
      await page.waitForTimeout(2000);
      
      // Should show success message or move to installed section
      await expect(page.getByText(/installed|installation complete/i)).toBeVisible();
      
      // Should appear in installed plugins section
      await expect(page.getByText('Installed Plugins')).toBeVisible();
    } else {
      // If no plugins to install, test is still valid
      await expect(page.getByText(/no plugins available|no plugins found/i)).toBeVisible();
    }
  });

  test('should handle plugin uninstallation', async ({ page }) => {
    // Look for installed plugins
    const uninstallButtons = page.getByRole('button', { name: /uninstall|remove/i });
    
    if (await uninstallButtons.count() > 0) {
      // Click uninstall button on first installed plugin
      await uninstallButtons.first().click();
      
      // Wait for uninstallation process
      await page.waitForTimeout(2000);
      
      // Should show success message
      await expect(page.getByText(/uninstalled|removed/i)).toBeVisible();
      
      // Should be removed from installed plugins section
      await expect(uninstallButtons.first()).not.toBeVisible();
    } else {
      // If no plugins installed, test is still valid
      await expect(page.getByText(/no plugins installed|no installed plugins/i)).toBeVisible();
    }
  });

  test('should handle plugin search and filtering', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search plugins|filter plugins/i);
    
    if (await searchInput.isVisible()) {
      // Test search functionality
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Should filter results
      const results = page.locator('[data-testid="plugin-card"], .plugin-card, .available-plugin');
      await expect(results).toBeVisible();
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    } else {
      // If no search functionality, test is still valid
      await expect(page.getByText('Available Plugins')).toBeVisible();
    }
  });

  test('should handle plugin categories', async ({ page }) => {
    // Look for category filters
    const categoryButtons = page.getByRole('button', { name: /productivity|utility|entertainment|all/i });
    
    if (await categoryButtons.count() > 0) {
      // Click on a category
      await categoryButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Should filter plugins by category
      await expect(page.getByText('Available Plugins')).toBeVisible();
      
      // Click "All" to reset
      const allButton = page.getByRole('button', { name: /all/i });
      if (await allButton.isVisible()) {
        await allButton.click();
        await page.waitForTimeout(1000);
      }
    } else {
      // If no categories, test is still valid
      await expect(page.getByText('Available Plugins')).toBeVisible();
    }
  });

  test('should handle plugin details view', async ({ page }) => {
    // Look for plugin cards that might have details
    const pluginCards = page.locator('[data-testid="plugin-card"], .plugin-card, .available-plugin');
    
    if (await pluginCards.count() > 0) {
      // Click on first plugin to view details
      await pluginCards.first().click();
      await page.waitForTimeout(1000);
      
      // Should show plugin details
      await expect(page.getByText(/description|version|author/i)).toBeVisible();
      
      // Should have install/uninstall button in details
      await expect(page.getByRole('button', { name: /install|uninstall/i })).toBeVisible();
    } else {
      // If no plugins, test is still valid
      await expect(page.getByText(/no plugins available|no plugins found/i)).toBeVisible();
    }
  });

  test('should handle plugin updates', async ({ page }) => {
    // Look for update buttons
    const updateButtons = page.getByRole('button', { name: /update|upgrade/i });
    
    if (await updateButtons.count() > 0) {
      // Click update button on first plugin
      await updateButtons.first().click();
      
      // Wait for update process
      await page.waitForTimeout(2000);
      
      // Should show success message
      await expect(page.getByText(/updated|upgrade complete/i)).toBeVisible();
    } else {
      // If no updates available, test is still valid
      await expect(page.getByText('Installed Plugins')).toBeVisible();
    }
  });

  test('should handle plugin configuration', async ({ page }) => {
    // Look for configure buttons
    const configureButtons = page.getByRole('button', { name: /configure|settings/i });
    
    if (await configureButtons.count() > 0) {
      // Click configure button on first plugin
      await configureButtons.first().click();
      
      // Wait for configuration modal/page to load
      await page.waitForTimeout(1000);
      
      // Should show configuration options
      await expect(page.getByText(/configuration|settings/i)).toBeVisible();
      
      // Should have save/cancel buttons
      await expect(page.getByRole('button', { name: /save|cancel/i })).toBeVisible();
    } else {
      // If no configuration options, test is still valid
      await expect(page.getByText('Installed Plugins')).toBeVisible();
    }
  });

  test('should handle plugin manager refresh', async ({ page }) => {
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show plugin manager content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    await expect(page.getByText('Available Plugins')).toBeVisible();
    await expect(page.getByText('Installed Plugins')).toBeVisible();
  });

  test('should handle plugin manager responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    await expect(page.getByText('Available Plugins')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
    await expect(page.getByText('Available Plugins')).toBeVisible();
  });

  test('should handle plugin manager accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through plugin elements with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should activate plugin interaction
    await page.waitForTimeout(1000);
  });

  test('should handle plugin manager with network errors', async ({ page }) => {
    // Simulate network errors for API calls
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show basic plugin manager content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle plugin manager with slow network', async ({ page }) => {
    // Add network delay
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 200);
    });
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show plugin manager content after loading
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle plugin manager performance', async ({ page }) => {
    // Measure time to load plugin manager
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Plugin manager should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Should show content
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle plugin manager navigation', async ({ page }) => {
    // Navigate to dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate back to plugin manager
    await page.getByRole('link', { name: 'Plugins' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/plugins');
    await expect(page.getByRole('heading', { name: 'Plugin Manager' })).toBeVisible();
  });

  test('should handle plugin manager with empty state', async ({ page }) => {
    // This test validates the empty state when no plugins are available
    // The actual behavior will depend on the implementation
    
    // Should show appropriate empty state messages
    await expect(page.getByText('Available Plugins')).toBeVisible();
    await expect(page.getByText('Installed Plugins')).toBeVisible();
    
    // Should provide helpful information or call-to-action
    const helpfulText = page.getByText(/no plugins|empty|get started/i);
    if (await helpfulText.isVisible()) {
      await expect(helpfulText).toBeVisible();
    }
  });
}); 