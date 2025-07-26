import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PluginManagerPage from '../PluginManagerPage';
import { PluginInfo, PluginStatus } from '../../../../shared/types';

// Mock the PluginManager module
jest.mock('../../../../features/plugin-manager/services/plugin.manager', () => {
  const mockPluginManager = {
    getAvailablePlugins: jest.fn().mockResolvedValue([]),
    getInstalledPlugins: jest.fn().mockResolvedValue([]),
    installPlugin: jest.fn().mockResolvedValue({ success: true }),
    enablePlugin: jest.fn().mockResolvedValue(undefined),
    disablePlugin: jest.fn().mockResolvedValue(undefined),
    uninstallPlugin: jest.fn().mockResolvedValue(undefined)
  };

  return {
    PluginManager: jest.fn().mockImplementation(() => mockPluginManager)
  };
});

// Import the mocked PluginManager to get access to the mock instance
import { PluginManager } from '../../../../features/plugin-manager/services/plugin.manager';

describe('PluginManagerPage', () => {
  let mockPluginManager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked instance
    mockPluginManager = new PluginManager();
    
    // Reset mock implementations
    mockPluginManager.getAvailablePlugins.mockResolvedValue([]);
    mockPluginManager.getInstalledPlugins.mockResolvedValue([]);
    mockPluginManager.installPlugin.mockResolvedValue({ success: true });
    mockPluginManager.enablePlugin.mockResolvedValue(undefined);
    mockPluginManager.disablePlugin.mockResolvedValue(undefined);
    mockPluginManager.uninstallPlugin.mockResolvedValue(undefined);
  });

  const renderPluginManagerPage = () => {
    return render(
      <BrowserRouter>
        <PluginManagerPage />
      </BrowserRouter>
    );
  };

  const createMockPlugin = (id: string, name: string, status: PluginStatus = PluginStatus.AVAILABLE): PluginInfo => ({
    id,
    name,
    version: '1.0.0',
    description: `Description for ${name}`,
    author: 'Test Author',
    rating: 4.5,
    downloads: 1000,
    dependencies: [],
    permissions: [],
    status
  });

  describe('Plugin Grid Layout', () => {
    it('should display available plugins in a grid layout', async () => {
      const mockPlugins = [
        createMockPlugin('plugin-1', 'Test Plugin 1'),
        createMockPlugin('plugin-2', 'Test Plugin 2')
      ];

      mockPluginManager.getAvailablePlugins.mockResolvedValue(mockPlugins);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
        expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no plugins are available', async () => {
      mockPluginManager.getAvailablePlugins.mockResolvedValue([]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('No plugins available')).toBeInTheDocument();
        expect(screen.getByText('Plugin marketplace coming soon')).toBeInTheDocument();
      });
    });

    it('should have proper CSS classes for responsive grid', async () => {
      renderPluginManagerPage();

      await waitFor(() => {
        const pluginGrid = screen.getByText('No plugins available').closest('.available-plugins-section');
        expect(pluginGrid).toHaveClass('available-plugins-section');
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should display search input for filtering plugins', async () => {
      renderPluginManagerPage();

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search plugins...');
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should filter plugins based on search input', async () => {
      const mockPlugins = [
        createMockPlugin('plugin-1', 'Analytics Plugin'),
        createMockPlugin('plugin-2', 'Dashboard Widget')
      ];

      mockPluginManager.getAvailablePlugins.mockResolvedValue(mockPlugins);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Analytics Plugin')).toBeInTheDocument();
        expect(screen.getByText('Dashboard Widget')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'Analytics' } });

      await waitFor(() => {
        expect(screen.getByText('Analytics Plugin')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard Widget')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      const mockPlugins = [
        createMockPlugin('plugin-1', 'Analytics Plugin')
      ];

      mockPluginManager.getAvailablePlugins.mockResolvedValue(mockPlugins);

      renderPluginManagerPage();

      // Wait for the component to load and render the search input
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search plugins...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No plugins found matching your search')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Cards', () => {
    it('should display plugin cards with ratings and descriptions', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Test Plugin')).toBeInTheDocument();
        expect(screen.getByText('Description for Test Plugin')).toBeInTheDocument();
        expect(screen.getByText('★ 4.5')).toBeInTheDocument(); // Rating with star
        expect(screen.getByText('1,000 downloads')).toBeInTheDocument();
      });
    });

    it('should display plugin author information', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('by Test Author')).toBeInTheDocument();
      });
    });

    it('should show plugin dependencies when present', async () => {
      const mockPlugin = {
        ...createMockPlugin('plugin-1', 'Test Plugin'),
        dependencies: [{ id: 'dependency-1', version: '^1.0.0', required: true }]
      };

      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Dependencies:')).toBeInTheDocument();
        expect(screen.getByText('dependency-1 ^1.0.0')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Installation Flow', () => {
    it('should display install button for available plugins', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        const installButton = screen.getByText('Install');
        expect(installButton).toBeInTheDocument();
      });
    });

    it('should show installation progress when installing plugin', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);
      
      // Make the install operation async so we can see the "Installing..." state
      mockPluginManager.installPlugin.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      renderPluginManagerPage();

      await waitFor(() => {
        const installButton = screen.getByText('Install');
        fireEvent.click(installButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Installing...')).toBeInTheDocument();
        expect(mockPluginManager.installPlugin).toHaveBeenCalledWith(expect.objectContaining({
          id: 'plugin-1'
        }));
      });
    });

    it('should show success message after successful installation', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        const installButton = screen.getByText('Install');
        fireEvent.click(installButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Plugin installed successfully')).toBeInTheDocument();
      });
    });

    it('should show error message when installation fails', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);
      mockPluginManager.installPlugin.mockResolvedValue({ 
        success: false, 
        pluginId: 'plugin-1',
        error: 'Installation failed' 
      });

      renderPluginManagerPage();

      await waitFor(() => {
        const installButton = screen.getByText('Install');
        fireEvent.click(installButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Installation failed')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Verification Status', () => {
    it('should display verification status for plugins', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Verified')).toBeInTheDocument();
      });
    });

    it('should show security information for plugins', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Security: Safe')).toBeInTheDocument();
      });
    });
  });

  describe('Installed Plugins Management', () => {
    it('should display installed plugins section', async () => {
      const mockInstalledPlugin = createMockPlugin('plugin-1', 'Installed Plugin', PluginStatus.INSTALLED);
      mockPluginManager.getInstalledPlugins.mockResolvedValue([mockInstalledPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Installed Plugins')).toBeInTheDocument();
        expect(screen.getByText('Installed Plugin')).toBeInTheDocument();
      });
    });

    it('should show enable/disable toggle for installed plugins', async () => {
      const mockInstalledPlugin = createMockPlugin('plugin-1', 'Installed Plugin', PluginStatus.INSTALLED);
      mockPluginManager.getInstalledPlugins.mockResolvedValue([mockInstalledPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        const toggleButton = screen.getByRole('checkbox');
        expect(toggleButton).toBeInTheDocument();
      });
    });

    it('should show uninstall button for installed plugins', async () => {
      const mockInstalledPlugin = createMockPlugin('plugin-1', 'Installed Plugin', PluginStatus.INSTALLED);
      mockPluginManager.getInstalledPlugins.mockResolvedValue([mockInstalledPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        const uninstallButton = screen.getByText('Uninstall');
        expect(uninstallButton).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when uninstalling plugin', async () => {
      const mockInstalledPlugin = createMockPlugin('plugin-1', 'Installed Plugin', PluginStatus.INSTALLED);
      mockPluginManager.getInstalledPlugins.mockResolvedValue([mockInstalledPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        const uninstallButton = screen.getByText('Uninstall');
        fireEvent.click(uninstallButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Uninstall Plugin')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to uninstall Installed Plugin?')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display graceful error state when plugin loading fails', async () => {
      mockPluginManager.getAvailablePlugins.mockRejectedValue(new Error('Failed to load plugins'));

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load plugins')).toBeInTheDocument();
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });
    });

    it('should handle plugin operation errors gracefully', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);
      mockPluginManager.installPlugin.mockRejectedValue(new Error('Network error'));

      renderPluginManagerPage();

      await waitFor(() => {
        const installButton = screen.getByText('Install');
        fireEvent.click(installButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with PluginManager', () => {
    it('should call PluginManager methods on component mount', async () => {
      renderPluginManagerPage();

      await waitFor(() => {
        expect(mockPluginManager.getAvailablePlugins).toHaveBeenCalled();
        expect(mockPluginManager.getInstalledPlugins).toHaveBeenCalled();
      });
    });

    it('should use PluginManager for plugin operations', async () => {
      const mockPlugin = createMockPlugin('plugin-1', 'Test Plugin');
      mockPluginManager.getAvailablePlugins.mockResolvedValue([mockPlugin]);

      renderPluginManagerPage();

      await waitFor(() => {
        const installButton = screen.getByText('Install');
        fireEvent.click(installButton);
      });

      await waitFor(() => {
        expect(mockPluginManager.installPlugin).toHaveBeenCalled();
      });
    });
  });
}); 