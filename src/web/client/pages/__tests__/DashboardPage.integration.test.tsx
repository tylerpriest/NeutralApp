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

describe('DashboardPage - Integration Tests (Would Catch Generic Widget Issues)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('should render actual reading widgets, not generic placeholders', async () => {
    // This test would have caught the generic widget issue!
    const mockInstalledPlugins = [
      {
        id: 'reading-core',
        name: 'Reading Core',
        status: 'enabled'
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: mockInstalledPlugins })
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // CRITICAL: This would have failed with generic widgets
    await waitFor(() => {
      // Should show actual reading widget content, not generic placeholder
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
      
      // Should NOT show generic placeholder text
      expect(screen.queryByText('Plugin widget content will appear here.')).not.toBeInTheDocument();
      expect(screen.queryByText('Reading Core Widget')).not.toBeInTheDocument();
    });

    // Should show actual widget functionality
    expect(screen.getByText('Add Book')).toBeInTheDocument();
    expect(screen.getByText('No books in library')).toBeInTheDocument();
    expect(screen.getByText('Import your first book')).toBeInTheDocument();
  });

  test('should verify widget factory renders correct components', async () => {
    // Test that WidgetFactory actually renders the right components
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
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: mockInstalledPlugins })
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Verify reading widgets render correctly
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
    });

    // Verify demo widget renders correctly (not generic)
    expect(screen.getByText('Hello World Demo Widget')).toBeInTheDocument();
  });

  test('should detect when plugins are not properly installed', async () => {
    // This test would catch the "no plugins installed" scenario
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: [] })
    });

    render(<DashboardPage />);

    // Should show welcome screen, not empty dashboard
    // Note: WelcomeScreen requires Router context, so we'll test for empty state instead
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Your installed plugins and widgets')).toBeInTheDocument();
    });

    // Should NOT show any widgets
    expect(screen.queryByText('📚 Book Library')).not.toBeInTheDocument();
    expect(screen.queryByText('🕒 Recently Read')).not.toBeInTheDocument();
  });

  test('should verify dashboard creates correct widget configurations', async () => {
    // Test the dashboard's widget creation logic
    const mockInstalledPlugins = [
      {
        id: 'reading-core',
        name: 'Reading Core',
        status: 'enabled'
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: mockInstalledPlugins })
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Verify dashboard creates the right number of widgets
    // reading-core should create 2 widgets: library and recent
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
    });

    // Should not create generic widgets
    expect(screen.queryByText('Reading Core Widget')).not.toBeInTheDocument();
  });

  test('should verify widget content is functional, not just placeholder', async () => {
    // Test that widgets show real content, not just placeholders
    const mockInstalledPlugins = [
      {
        id: 'reading-core',
        name: 'Reading Core',
        status: 'enabled'
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ installed: mockInstalledPlugins })
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Verify widgets show functional content
    await waitFor(() => {
      // Library widget should show stats and actions
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('Add Book')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Reading')).toBeInTheDocument();
      
      // Recent widget should show activity
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
      expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
    });
  });
}); 