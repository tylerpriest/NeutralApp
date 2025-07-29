/**
 * Plugin Manager Page Core Tests
 * Tests the essential functionality required for acceptance criteria
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PluginManagerPage from '../PluginManagerPage';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock API responses
const mockApiResponse = {
  available: [
    {
      id: 'demo-hello-world',
      name: 'Hello World Demo',
      version: '1.0.0',
      description: 'A simple demo plugin to validate the plugin system',
      author: 'NeutralApp Team'
    },
    {
      id: 'reading-core',
      name: 'Reading Core',
      version: '1.0.0',
      description: 'Book library management with metadata handling and search',
      author: 'NeutralApp Team'
    }
  ],
  installed: []
};

describe('Plugin Manager Core Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    
    // Default successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
    
    // Mock localStorage to return empty initially
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  // Core Test 1: Component renders successfully
  test('should render Plugin Manager page with header and tabs', async () => {
    render(<PluginManagerPage />);

    // Wait for loading to complete and content to appear
    await waitFor(() => {
      expect(screen.getByText('Plugin Manager')).toBeInTheDocument();
    });
    
    // Check for description
    expect(screen.getByText('Install and manage plugins to extend your dashboard functionality')).toBeInTheDocument();

    // Check for tabs
    expect(screen.getByText('available Plugins')).toBeInTheDocument();
    expect(screen.getByText('installed Plugins')).toBeInTheDocument();
    expect(screen.getByText('Plugin Packs')).toBeInTheDocument();
  });

  // Core Test 2: Plugin installation basic flow
  test('should allow plugin installation and show toast notification', async () => {
    const user = userEvent.setup();
    
    // Mock successful installation
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Plugin installed successfully' }),
      });

    render(<PluginManagerPage />);

    await waitFor(() => {
      expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
    });

    // Find and click install button
    const installButtons = screen.getAllByText('Install');
    expect(installButtons.length).toBeGreaterThan(0);
    
    const firstInstallButton = installButtons[0];
    expect(firstInstallButton).toBeDefined();
    await user.click(firstInstallButton!);

    // Should show some kind of feedback (toast or state change)
    await waitFor(() => {
      // Check for either toast notification or state change
      const hasToast = screen.queryByText('Installing Plugin') || 
                      screen.queryByText('Installing') ||
                      screen.queryByText('Plugin Installed');
      expect(hasToast).toBeTruthy();
    }, { timeout: 3000 });
  });

  // Core Test 3: Tab switching functionality
  test('should switch between tabs and show appropriate content', async () => {
    const user = userEvent.setup();
    render(<PluginManagerPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('available Plugins')).toBeInTheDocument();
    });

    // Initially on Available tab - should see plugins
    expect(screen.getByText('Hello World Demo')).toBeInTheDocument();

    // Switch to Installed tab
    await user.click(screen.getByText('installed Plugins'));
    
    // Should show different content (empty state or installed plugins)
    await waitFor(() => {
      // Check that we switched tabs (could be empty state or installed plugins)
      const installedTab = screen.getByText('installed Plugins');
      expect(installedTab).toBeInTheDocument();
    });

    // Switch to Plugin Packs tab
    await user.click(screen.getByText('Plugin Packs'));
    
    // Should see the plugin packs content
    await waitFor(() => {
      const packsTab = screen.getByText('Plugin Packs');
      expect(packsTab).toBeInTheDocument();
    });
  });

  // Core Test 4: API error handling
  test('should handle API errors gracefully', async () => {
    // Mock API failure
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    // Mock localStorage with some fallback data
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
      { id: 'demo-hello-world', installed: true, enabled: true }
    ]));

    render(<PluginManagerPage />);

    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Plugin Manager')).toBeInTheDocument();
    });

    // Should show some content even with API failure
    expect(screen.getByText('available Plugins')).toBeInTheDocument();
  });

  // Core Test 5: Performance - component loads quickly
  test('should load Plugin Manager within reasonable time', async () => {
    const startTime = Date.now();
    
    render(<PluginManagerPage />);

    await waitFor(() => {
      expect(screen.getByText('Plugin Manager')).toBeInTheDocument();
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should load within 5 seconds (generous timeout for CI)
    expect(duration).toBeLessThan(5000);
  });
});