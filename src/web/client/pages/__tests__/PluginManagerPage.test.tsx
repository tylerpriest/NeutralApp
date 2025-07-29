import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PluginManagerPage from '../PluginManagerPage';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockPlugins = {
  available: [
    {
      id: 'test-plugin-1',
      name: 'Test Plugin 1',
      version: '1.0.0',
      description: 'A test plugin for testing purposes',
      author: 'Test Author',
      rating: 4.5,
      downloads: 1000,
      dependencies: [],
      permissions: [],
      status: 'available'
    },
    {
      id: 'test-plugin-2',
      name: 'Test Plugin 2',
      version: '2.0.0',
      description: 'Another test plugin',
      author: 'Another Author',
      rating: 4.0,
      downloads: 500,
      dependencies: [
        { id: 'dependency-1', version: '1.0.0', required: true }
      ],
      permissions: [],
      status: 'available'
    }
  ],
  installed: [
    {
      id: 'installed-plugin-1',
      name: 'Installed Plugin',
      version: '1.0.0',
      description: 'An installed plugin',
      author: 'Installed Author',
      rating: 4.2,
      downloads: 2000,
      dependencies: [],
      permissions: [],
      status: 'enabled'
    }
  ]
};

const renderPluginManagerPage = () => {
  return render(<PluginManagerPage />);
};

describe('PluginManagerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderPluginManagerPage();
      
      expect(screen.getByText('Loading plugins...')).toBeInTheDocument();
    });
  });

  describe('Plugin Display', () => {
    it('should display available plugins after loading', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
        expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
      });
    });

    it('should display plugin information correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
        expect(screen.getByText('A test plugin for testing purposes')).toBeInTheDocument();
        expect(screen.getByText('v1.0.0 by Test Author')).toBeInTheDocument();
        expect(screen.getByText('v2.0.0 by Another Author')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter plugins based on search term', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'Test Plugin 1' } });

      expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Plugin 2')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search plugins...');
      fireEvent.change(searchInput, { target: { value: 'Non-existent Plugin' } });

      expect(screen.getByText('No plugins found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should filter by all plugins', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('All (3)')).toBeInTheDocument();
        expect(screen.getByText('Installed (1)')).toBeInTheDocument();
        expect(screen.getByText('Available (2)')).toBeInTheDocument();
      });
    });

    it('should filter by installed plugins only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        const installedButton = screen.getByText('Installed (1)');
        fireEvent.click(installedButton);
      });

      expect(screen.getByText('Installed Plugin')).toBeInTheDocument();
      expect(screen.queryByText('Test Plugin 1')).not.toBeInTheDocument();
    });

    it('should filter by available plugins only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        const availableButton = screen.getByText('Available (2)');
        fireEvent.click(availableButton);
      });

      expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
      expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
      expect(screen.queryByText('Installed Plugin')).not.toBeInTheDocument();
    });
  });

  describe('Plugin Installation Flow', () => {
    it('should show success message after successful installation', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        });

      renderPluginManagerPage();

      await waitFor(() => {
        const installButtons = screen.getAllByText('Install');
        if (installButtons[0]) {
          fireEvent.click(installButtons[0]); // Click the first install button
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1 installed successfully')).toBeInTheDocument();
      });
    });

    it('should show error message when installation fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Installation failed' })
        });

      renderPluginManagerPage();

      await waitFor(() => {
        const installButtons = screen.getAllByText('Install');
        if (installButtons[0]) {
          fireEvent.click(installButtons[0]);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Installation failed')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Management', () => {
    it('should show enable/disable button for installed plugins', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Enabled')).toBeInTheDocument();
      });
    });

    it('should show uninstall button for installed plugins', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Uninstall')).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when uninstalling plugin', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        const uninstallButton = screen.getByText('Uninstall');
        fireEvent.click(uninstallButton);
      });

      expect(screen.getByText('Uninstall Plugin')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to uninstall/)).toBeInTheDocument();
    });
  });

  describe('Dependency Management', () => {
    it('should show dependency information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Dependencies')).toBeInTheDocument();
        expect(screen.getByText('dependency-1')).toBeInTheDocument();
      });
    });

    it('should show dependency details dialog', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlugins
      });

      renderPluginManagerPage();

      await waitFor(() => {
        const detailsButton = screen.getByText('Details');
        fireEvent.click(detailsButton);
      });

      expect(screen.getByText('Dependencies for Test Plugin 2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display graceful error state when plugin loading fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load plugins')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should handle plugin operation errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        })
        .mockRejectedValueOnce(new Error('Operation failed'));

      renderPluginManagerPage();

      await waitFor(() => {
        const installButtons = screen.getAllByText('Install');
        if (installButtons[0]) {
          fireEvent.click(installButtons[0]);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Operation failed')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no plugins are available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: [], installed: [] })
      });

      renderPluginManagerPage();

      await waitFor(() => {
        expect(screen.getByText('No plugins available')).toBeInTheDocument();
        expect(screen.getByText('Plugin marketplace coming soon')).toBeInTheDocument();
      });
    });
  });

  describe('Notification System', () => {
    it('should show success notifications', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        });

      renderPluginManagerPage();

      await waitFor(() => {
        const installButtons = screen.getAllByText('Install');
        if (installButtons[0]) {
          fireEvent.click(installButtons[0]);
        }
      });

      await waitFor(() => {
        const notification = screen.getByText('Test Plugin 1 installed successfully');
        expect(notification).toBeInTheDocument();
        
        // Test notification dismissal
        const closeButton = notification.parentElement?.querySelector('button');
        if (closeButton) {
          fireEvent.click(closeButton);
        }
      });
    });

    it('should show error notifications', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlugins
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Installation failed' })
        });

      renderPluginManagerPage();

      await waitFor(() => {
        const installButtons = screen.getAllByText('Install');
        if (installButtons[0]) {
          fireEvent.click(installButtons[0]);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Installation failed')).toBeInTheDocument();
      });
    });
  });
}); 