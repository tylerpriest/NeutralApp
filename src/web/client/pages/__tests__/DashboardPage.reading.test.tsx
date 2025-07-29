import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../DashboardPage';

// Mock the fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('DashboardPage - Reading Plugin Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('should display reading widgets when reading plugins are installed', async () => {
    // Mock installed plugins with reading plugins
    const mockInstalledPlugins = [
      {
        id: 'reading-core',
        name: 'Reading Core',
        status: 'enabled'
      },
      {
        id: 'reading-ui',
        name: 'Reading UI',
        status: 'enabled'
      },
      {
        id: 'reading-persistence',
        name: 'Reading Persistence',
        status: 'enabled'
      }
    ];

    // Mock API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: mockInstalledPlugins })
    });

    render(<DashboardPage />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Check that reading widgets are displayed
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
    });

    // Check that widgets show proper content
    expect(screen.getByText('No books in library')).toBeInTheDocument();
    expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
    expect(screen.getByText('Open a book to start reading')).toBeInTheDocument();
    expect(screen.getByText('Your reading progress and bookmarks')).toBeInTheDocument();
  });

  test('should fallback to localStorage when API fails', async () => {
    // Mock API failure
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    // Mock localStorage with reading plugins
    const mockLocalStoragePlugins = [
      {
        id: 'reading-core',
        name: 'Reading Core',
        enabled: true
      },
      {
        id: 'reading-ui',
        name: 'Reading UI',
        enabled: true
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLocalStoragePlugins));

    render(<DashboardPage />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Check that reading widgets are displayed from localStorage
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
    });
  });

  test('should show welcome screen when no plugins are installed', async () => {
    // Mock API response with no plugins
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: [] })
    });

    render(<DashboardPage />);

    // Should show welcome screen
    await waitFor(() => {
      expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
    });
  });

  test('should handle mixed plugin types correctly', async () => {
    // Mock installed plugins with mixed types
    const mockInstalledPlugins = [
      {
        id: 'reading-core',
        name: 'Reading Core',
        status: 'enabled'
      },
      {
        id: 'demo-hello-world',
        name: 'Hello World Demo',
        status: 'enabled'
      },
      {
        id: 'weather-widget',
        name: 'Weather Widget',
        status: 'enabled'
      }
    ];

    // Mock API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: mockInstalledPlugins })
    });

    render(<DashboardPage />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Check that all widget types are displayed
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
      expect(screen.getByText('Hello World Demo Widget')).toBeInTheDocument();
      expect(screen.getByText('Weather Widget Widget')).toBeInTheDocument();
    });
  });
}); 