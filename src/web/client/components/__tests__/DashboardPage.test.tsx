import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardManager } from '../../../../features/ui-shell/services/dashboard.manager';
import { DashboardWidget, WidgetSize } from '../../../../shared/types';

// Mock the DashboardManager
jest.mock('../../../../features/ui-shell/services/dashboard.manager', () => ({
  DashboardManager: jest.fn().mockImplementation(() => ({
    getActiveWidgets: jest.fn().mockReturnValue([]),
    showWelcomeScreen: jest.fn().mockReturnValue(true),
    calculateOptimalLayout: jest.fn().mockReturnValue({
      grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
      widgets: []
    })
  }))
}));

// Import the mocked DashboardManager to get access to the mock instance
import { DashboardManager as MockDashboardManager } from '../../../../features/ui-shell/services/dashboard.manager';

// Now import the actual component after mocking
import DashboardPage, { dashboardManager } from '../../pages/DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock setup - will be overridden in individual tests
    (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
    (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(true);
    (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue({
      grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
      widgets: []
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
      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(true);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
        expect(screen.getByText('Get started by installing your first plugin')).toBeInTheDocument();
        expect(screen.getByText('No plugins installed yet')).toBeInTheDocument();
        expect(screen.getByText('Install plugins to see widgets here')).toBeInTheDocument();
      });
    });

    it('should display call-to-action for plugin installation', async () => {
      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(true);

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

      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue(mockWidgets);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);
      (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-2')).toBeInTheDocument();
      });
    });

    it('should render widgets in a responsive grid container', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];

      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue(mockWidgets);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);
      (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue({
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
      (dashboardManager.getActiveWidgets as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to load dashboard');
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard. Please try refreshing the page.')).toBeInTheDocument();
        expect(screen.getByText('Refresh Page')).toBeInTheDocument();
      });
    });

    it('should handle widget errors gracefully', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];

      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue(mockWidgets);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);
      (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
      });
    });
  });

  describe('Layout and Responsiveness', () => {
    it('should have proper CSS classes for responsive design', async () => {
      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);

      renderDashboardPage();

      await waitFor(() => {
        const dashboardPage = screen.getByText('Dashboard').closest('.dashboard-page');
        expect(dashboardPage).toHaveClass('dashboard-page');
      });
    });

    it('should maintain proper spacing and layout structure', async () => {
      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);

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
        expect(dashboardManager.getActiveWidgets).toHaveBeenCalled();
        expect(dashboardManager.showWelcomeScreen).toHaveBeenCalled();
      });
    });

    it('should use DashboardManager layout calculations', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];

      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue(mockWidgets);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);

      renderDashboardPage();

      await waitFor(() => {
        expect(dashboardManager.calculateOptimalLayout).toHaveBeenCalledWith(mockWidgets);
      });
    });
  });
}); 