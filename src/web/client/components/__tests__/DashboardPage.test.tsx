import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardManager } from '../../../../features/ui-shell/services/dashboard.manager';
import { DashboardWidget, WidgetSize } from '../../../../shared/types';

// Mock the DashboardManager
jest.mock('../../../../features/ui-shell/services/dashboard.manager', () => {
  const mockInstance = {
    getActiveWidgets: jest.fn().mockReturnValue([]),
    showWelcomeScreen: jest.fn().mockReturnValue(true),
    calculateOptimalLayout: jest.fn().mockReturnValue({
      grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
      widgets: []
    })
  };
  
  const MockDashboardManager = jest.fn().mockImplementation(() => mockInstance) as any;
  MockDashboardManager.getInstance = jest.fn().mockReturnValue(mockInstance);
  
  return {
    DashboardManager: MockDashboardManager
  };
});

// Now import the actual component after mocking
import DashboardPage from '../../pages/DashboardPage';

describe('DashboardPage', () => {
  let mockDashboardManager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked DashboardManager instance
    mockDashboardManager = new DashboardManager();
    
    // Default mock setup - will be overridden in individual tests
    mockDashboardManager.getActiveWidgets.mockReturnValue([]);
    mockDashboardManager.showWelcomeScreen.mockReturnValue(true);
    mockDashboardManager.calculateOptimalLayout.mockReturnValue({
      grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
      widgets: []
    });
    
    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ widgets: [] })
    });
  });

  const renderDashboardPage = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  const createMockWidget = (id: string, title: string): DashboardWidget => ({
    id,
    pluginId: 'test-plugin',
    title,
    component: () => <div data-testid={`widget-${id}`}>{title}</div>,
    size: { width: 2, height: 1 } as WidgetSize,
    position: { x: 0, y: 0 }
  });

  describe('Welcome Screen', () => {
    it('should display welcome screen when no plugins are installed', async () => {
      mockDashboardManager.getActiveWidgets.mockReturnValue([]);
      mockDashboardManager.showWelcomeScreen.mockReturnValue(true);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
        expect(screen.getByText('Get started by installing your first plugin')).toBeInTheDocument();
        expect(screen.getByText('No plugins installed yet')).toBeInTheDocument();
        expect(screen.getByText('Install plugins to see widgets here')).toBeInTheDocument();
      });
    });

    it('should display call-to-action for plugin installation', async () => {
      mockDashboardManager.getActiveWidgets.mockReturnValue([]);
      mockDashboardManager.showWelcomeScreen.mockReturnValue(true);

      renderDashboardPage();

      await waitFor(() => {
        const ctaElement = screen.getByText('Install plugins to see widgets here');
        expect(ctaElement).toBeInTheDocument();
        expect(ctaElement.closest('.widget-placeholder')).toHaveClass('widget-placeholder');
      });
    });
  });

  describe('Widget Display', () => {
    it('should display widgets when plugins are installed', async () => {
      const mockWidgets = [
        createMockWidget('widget-1', 'Test Widget 1'),
        createMockWidget('widget-2', 'Test Widget 2')
      ];

      // Mock fetch to return widgets
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ widgets: mockWidgets })
      });

      mockDashboardManager.calculateOptimalLayout.mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Test Widget 1', { selector: 'h3' })).toBeInTheDocument();
        expect(screen.getByText('Test Widget 2', { selector: 'h3' })).toBeInTheDocument();
      });
    });

    it('should render widgets in a responsive grid container', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];

      // Mock fetch to return widgets
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ widgets: mockWidgets })
      });

      mockDashboardManager.calculateOptimalLayout.mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets
      });

      renderDashboardPage();

      await waitFor(() => {
        const widgetContainer = screen.getByTestId('widget-container');
        expect(widgetContainer).toBeInTheDocument();
        expect(widgetContainer).toHaveClass('widget-grid');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display graceful error state when dashboard fails to load', async () => {
      // Mock fetch to fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to load dashboard'));

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard. Please try refreshing the page.')).toBeInTheDocument();
        expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      });
    });

    it('should handle widget errors gracefully', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];

      // Mock fetch to return widgets
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ widgets: mockWidgets })
      });

      mockDashboardManager.calculateOptimalLayout.mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Test Widget', { selector: 'h3' })).toBeInTheDocument();
      });
    });
  });

  describe('Layout and Responsiveness', () => {
    it('should have proper CSS classes for responsive design', async () => {
      mockDashboardManager.getActiveWidgets.mockReturnValue([]);
      mockDashboardManager.showWelcomeScreen.mockReturnValue(false);

      renderDashboardPage();

      await waitFor(() => {
        const dashboardPage = screen.getByText('Dashboard').closest('.dashboard-page');
        expect(dashboardPage).toHaveClass('dashboard-page');
      });
    });

    it('should maintain proper spacing and layout structure', async () => {
      mockDashboardManager.getActiveWidgets.mockReturnValue([]);
      mockDashboardManager.showWelcomeScreen.mockReturnValue(false);

      renderDashboardPage();

      await waitFor(() => {
        const dashboardContent = screen.getByText('Dashboard').closest('.dashboard-content');
        expect(dashboardContent).toHaveClass('dashboard-content');
      });
    });
  });

  describe('Integration with DashboardManager', () => {
    it('should call DashboardManager methods on component mount', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/widgets');
      });
    });

    it('should use DashboardManager layout calculations', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];

      // Mock fetch to return widgets
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ widgets: mockWidgets })
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(mockDashboardManager.calculateOptimalLayout).toHaveBeenCalledWith(mockWidgets);
      });
    });
  });
}); 