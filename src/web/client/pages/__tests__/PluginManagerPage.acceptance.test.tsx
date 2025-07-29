/**
 * Plugin Manager Page Acceptance Tests
 * Tests based on real-world acceptance criteria
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
      id: 'weather-widget',
      name: 'Weather Widget',
      version: '2.1.0',
      description: 'Display current weather information in your dashboard.',
      author: 'Weather Corp'
    },
    {
      id: 'reading-core',
      name: 'Reading Core',
      version: '1.0.0',
      description: 'Book library management with metadata handling and search',
      author: 'NeutralApp Team'
    },
    {
      id: 'reading-ui',
      name: 'Reading UI',
      version: '1.0.0',
      description: 'Clean reader interface with typography controls',
      author: 'NeutralApp Team'
    },
    {
      id: 'reading-persistence',
      name: 'Reading Persistence',
      version: '1.0.0',
      description: 'Reading position and bookmark storage',
      author: 'NeutralApp Team'
    }
  ],
  installed: []
};

describe('Plugin Manager Acceptance Tests', () => {
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

  // Feature 1: Plugin Manager UI/UX
  describe('Feature 1: Plugin Manager UI/UX', () => {
    describe('Acceptance Criteria 1.1: Tabbed Interface', () => {
      it('should display three distinct tabs with correct labels and count badges', async () => {
        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('available Plugins')).toBeInTheDocument();
          expect(screen.getByText('installed Plugins')).toBeInTheDocument();
          expect(screen.getByText('Plugin Packs')).toBeInTheDocument();
        });

        // Check count badges
        const availableTab = screen.getByText('available Plugins').parentElement;
        const installedTab = screen.getByText('installed Plugins').parentElement;
        
        expect(within(availableTab!).getByText('6')).toBeInTheDocument(); // 6 available plugins
        expect(within(installedTab!).getByText('0')).toBeInTheDocument(); // 0 installed plugins
      });

      it('should highlight active tab with blue underline', async () => {
        render(<PluginManagerPage />);

        await waitFor(() => {
          const availableTab = screen.getByText('available Plugins').parentElement;
          expect(availableTab).toHaveStyle('border-bottom: 2px solid #3B82F6');
        });
      });

      it('should filter content when switching tabs', async () => {
        const user = userEvent.setup();
        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('available Plugins')).toBeInTheDocument();
        });

        // Initially on Available tab - should see plugins
        expect(screen.getByText('Hello World Demo')).toBeInTheDocument();

        // Switch to Installed tab
        await user.click(screen.getByText('installed Plugins'));
        
        // Should see empty state for installed plugins
        await waitFor(() => {
          expect(screen.getByText('No installed plugins found')).toBeInTheDocument();
        });

        // Switch to Plugin Packs tab
        await user.click(screen.getByText('Plugin Packs'));
        
        // Should see the reading pack
        await waitFor(() => {
          expect(screen.getByText('Kindle-esque Reading Pack')).toBeInTheDocument();
        });
      });
    });

    describe('Acceptance Criteria 1.2: Toast Notifications', () => {
      it('should show toast notification when installing a plugin', async () => {
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

        // Click install button
        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        // Should show toast notification
        await waitFor(() => {
          expect(screen.getByText('Installing Plugin')).toBeInTheDocument();
          expect(screen.getByText(/Installing Hello World Demo/)).toBeInTheDocument();
        });
      });

      it('should show success toast and auto-dismiss after 5 seconds', async () => {
        const user = userEvent.setup();
        jest.useFakeTimers();
        
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              ...mockApiResponse,
              installed: [{ id: 'demo-hello-world', status: 'enabled' }]
            }),
          });

        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
        });

        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        // Wait for success toast
        await waitFor(() => {
          expect(screen.getByText('Plugin Installed')).toBeInTheDocument();
        });

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        // Toast should be dismissed
        await waitFor(() => {
          expect(screen.queryByText('Plugin Installed')).not.toBeInTheDocument();
        });

        jest.useRealTimers();
      });

      it('should allow click-to-dismiss toast notifications', async () => {
        const user = userEvent.setup();
        
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
          });

        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
        });

        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        // Wait for toast to appear
        await waitFor(() => {
          expect(screen.getByText('Installing Plugin')).toBeInTheDocument();
        });

        // Click on toast to dismiss
        const toast = screen.getByText('Installing Plugin').closest('div');
        await user.click(toast!);

        // Toast should be dismissed
        await waitFor(() => {
          expect(screen.queryByText('Installing Plugin')).not.toBeInTheDocument();
        });
      });
    });

    describe('Acceptance Criteria 1.3: Plugin State Management', () => {
      it('should move plugin from Available to Installed after successful installation', async () => {
        const user = userEvent.setup();
        
        // Mock API responses for installation flow
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              ...mockApiResponse,
              installed: [{ id: 'demo-hello-world', status: 'enabled' }]
            }),
          });

        render(<PluginManagerPage />);

        // Wait for initial load
        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
        });

        // Verify plugin is in Available tab
        expect(screen.getByText('Install')).toBeInTheDocument();

        // Install the plugin
        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        // Wait for installation to complete and page to refresh
        await waitFor(() => {
          expect(screen.queryByText('Installing...')).not.toBeInTheDocument();
        });

        // Switch to Installed tab
        await user.click(screen.getByText('installed Plugins'));

        // Plugin should now be in Installed tab
        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
          expect(screen.getByText('Enabled')).toBeInTheDocument();
        });

        // Switch back to Available tab
        await user.click(screen.getByText('available Plugins'));

        // Plugin should no longer be in Available tab
        await waitFor(() => {
          const availablePlugins = screen.queryAllByText('Hello World Demo');
          expect(availablePlugins).toHaveLength(0);
        });
      });

      it('should persist plugin state after page refresh', async () => {
        // Mock localStorage to return installed plugin
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
          { id: 'demo-hello-world', installed: true, enabled: true }
        ]));

        render(<PluginManagerPage />);

        // Switch to Installed tab
        const user = userEvent.setup();
        await user.click(screen.getByText('installed Plugins'));

        // Should show installed plugin from localStorage
        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
          expect(screen.getByText('Enabled')).toBeInTheDocument();
        });
      });
    });

    describe('Acceptance Criteria 1.4: Visual Plugin Categories', () => {
      it('should display reading plugins with blue book icons and category badges', async () => {
        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('Reading Core')).toBeInTheDocument();
        });

        // Find the reading plugin cards
        const readingCoreCard = screen.getByText('Reading Core').closest('div');
        const readingUICard = screen.getByText('Reading UI').closest('div');

        // Check for reading category badges
        expect(within(readingCoreCard!).getByText('reading')).toBeInTheDocument();
        expect(within(readingUICard!).getByText('reading')).toBeInTheDocument();

        // Verify blue styling for reading category
        const readingBadge = within(readingCoreCard!).getByText('reading');
        expect(readingBadge).toHaveStyle('background: #dbeafe');
        expect(readingBadge).toHaveStyle('color: #3B82F6');
      });
    });
  });

  // Feature 2: Reading Plugin Pack
  describe('Feature 2: Reading Plugin Pack', () => {
    describe('Acceptance Criteria 2.1: Plugin Pack Display', () => {
      it('should display Reading Pack with proper styling and information', async () => {
        const user = userEvent.setup();
        render(<PluginManagerPage />);

        // Switch to Plugin Packs tab
        await user.click(screen.getByText('Plugin Packs'));

        await waitFor(() => {
          expect(screen.getByText('Kindle-esque Reading Pack')).toBeInTheDocument();
        });

        // Verify pack information
        expect(screen.getByText('Complete reading experience with library management, clean UI, and progress tracking')).toBeInTheDocument();
        expect(screen.getByText('v1.0.0 • 3 plugins')).toBeInTheDocument();
        expect(screen.getByText('📚')).toBeInTheDocument(); // Pack icon

        // Verify included plugins list
        expect(screen.getByText('Included Plugins:')).toBeInTheDocument();
        expect(screen.getByText('Reading Core')).toBeInTheDocument();
        expect(screen.getByText('Reading UI')).toBeInTheDocument();
        expect(screen.getByText('Reading Persistence')).toBeInTheDocument();

        // Verify install button
        expect(screen.getByText('Install Plugin Pack')).toBeInTheDocument();
      });
    });

    describe('Acceptance Criteria 2.2: Pack Installation Flow', () => {
      it('should install entire plugin pack with sequential notifications', async () => {
        const user = userEvent.setup();
        jest.useFakeTimers();

        // Mock API responses for pack installation
        mockFetch
          .mockResolvedValue({
            ok: true,
            json: async () => mockApiResponse,
          })
          .mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
          });

        render(<PluginManagerPage />);

        // Switch to Plugin Packs tab
        await user.click(screen.getByText('Plugin Packs'));

        await waitFor(() => {
          expect(screen.getByText('Install Plugin Pack')).toBeInTheDocument();
        });

        // Click install pack button
        const installPackButton = screen.getByText('Install Plugin Pack');
        await user.click(installPackButton);

        // Should show pack installation toast
        await waitFor(() => {
          expect(screen.getByText('Installing Plugin Pack')).toBeInTheDocument();
          expect(screen.getByText(/Installing Kindle-esque Reading Pack/)).toBeInTheDocument();
        });

        jest.useRealTimers();
      });
    });

    describe('Acceptance Criteria 2.3: Pack Status Tracking', () => {
      it('should show pack as installed only when all plugins are installed', async () => {
        const user = userEvent.setup();
        
        // Mock partial installation - only reading-core installed
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            ...mockApiResponse,
            installed: [{ id: 'reading-core', status: 'enabled' }]
          }),
        });

        render(<PluginManagerPage />);

        await user.click(screen.getByText('Plugin Packs'));

        await waitFor(() => {
          expect(screen.getByText('Kindle-esque Reading Pack')).toBeInTheDocument();
        });

        // Pack should still show as available for installation
        expect(screen.getByText('Install Plugin Pack')).toBeInTheDocument();

        // Individual plugin status should show correctly
        const packCard = screen.getByText('Kindle-esque Reading Pack').closest('div');
        const readingCorePlugin = within(packCard!).getByText('Reading Core');
        const readingUIPlugin = within(packCard!).getByText('Reading UI');

        // Reading Core should have blue background (installed)
        expect(readingCorePlugin).toHaveStyle('background: #dbeafe');
        // Reading UI should have gray background (not installed)  
        expect(readingUIPlugin).toHaveStyle('background: #f3f4f6');
      });
    });
  });

  // Feature 3: Error Handling
  describe('Feature 5: Error Handling & Edge Cases', () => {
    describe('Acceptance Criteria 5.1: Network Failure Handling', () => {
      it('should fall back to local state when API fails', async () => {
        const user = userEvent.setup();
        
        // Mock API failure
        mockFetch.mockRejectedValue(new Error('Network error'));
        
        // Mock localStorage with some data
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
          { id: 'demo-hello-world', installed: true, enabled: true }
        ]));

        render(<PluginManagerPage />);

        // Should still render with fallback data
        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
        });

        // Try to install a plugin - should use local state
        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        // Should show local installation success
        await waitFor(() => {
          expect(screen.getByText(/has been installed locally/)).toBeInTheDocument();
        });
      });

      it('should show error toast for installation failures', async () => {
        const user = userEvent.setup();
        
        // Mock successful initial load but failed installation
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
          })
          .mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Installation failed' }),
          });

        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
        });

        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        // Should show error toast
        await waitFor(() => {
          expect(screen.getByText('Installation Failed')).toBeInTheDocument();
        });
      });
    });
  });

  // Feature 6: Performance
  describe('Feature 6: Performance & User Experience', () => {
    describe('Acceptance Criteria 6.1: Plugin Installation Speed', () => {
      it('should complete individual plugin installation within 3 seconds', async () => {
        const user = userEvent.setup();
        const startTime = Date.now();
        
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
          });

        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('Hello World Demo')).toBeInTheDocument();
        });

        const installButtons = screen.getAllByText('Install');
        expect(installButtons.length).toBeGreaterThan(0);
        const firstInstallButton = installButtons[0];
        expect(firstInstallButton).toBeDefined();
        await user.click(firstInstallButton!);

        await waitFor(() => {
          expect(screen.getByText('Plugin Installed')).toBeInTheDocument();
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      });
    });

    describe('Acceptance Criteria 6.2: Dashboard Widget Performance', () => {
      it('should load plugin manager within 2 seconds', async () => {
        const startTime = Date.now();
        
        render(<PluginManagerPage />);

        await waitFor(() => {
          expect(screen.getByText('Plugin Manager')).toBeInTheDocument();
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(2000); // Should load within 2 seconds
      });
    });
  });
});

// Integration test for complete user journey
describe('Complete User Journey Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  it('should complete full plugin installation journey', async () => {
    const user = userEvent.setup();
    
    // Mock API responses for complete journey
    let installationCount = 0;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url === '/api/plugins') {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse,
        });
      }
      if (url === '/api/plugins/install') {
        installationCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    render(<PluginManagerPage />);

    // 1. Verify initial state - Available tab is active
    await waitFor(() => {
      expect(screen.getByText('available Plugins')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument(); // 6 available plugins
    });

    // 2. Navigate to Plugin Packs tab
    await user.click(screen.getByText('Plugin Packs'));
    
    await waitFor(() => {
      expect(screen.getByText('Kindle-esque Reading Pack')).toBeInTheDocument();
    });

    // 3. Install the Reading Pack
    const installPackButton = screen.getByText('Install Plugin Pack');
    await user.click(installPackButton);

    // 4. Verify installation notifications appear
    await waitFor(() => {
      expect(screen.getByText('Installing Plugin Pack')).toBeInTheDocument();
    });

    // 5. Wait for installation to complete
    await waitFor(() => {
      expect(screen.getByText('Kindle-esque Reading Pack has been installed successfully!')).toBeInTheDocument();
    }, { timeout: 10000 });

    // 6. Verify pack shows as installed
    await waitFor(() => {
      expect(screen.getByText('✓ Plugin Pack Installed')).toBeInTheDocument();
    });

    // 7. Navigate to Installed tab and verify plugins are there
    await user.click(screen.getByText('installed Plugins'));
    
    await waitFor(() => {
      expect(screen.getByText('Reading Core')).toBeInTheDocument();
      expect(screen.getByText('Reading UI')).toBeInTheDocument();
      expect(screen.getByText('Reading Persistence')).toBeInTheDocument();
    });

    // 8. Verify count badges updated
    const installedTab = screen.getByText('installed Plugins').parentElement;
    expect(within(installedTab!).getByText('3')).toBeInTheDocument();
  });
});