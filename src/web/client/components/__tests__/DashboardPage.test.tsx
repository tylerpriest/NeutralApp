import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage, { dashboardManager } from '../../pages/DashboardPage';
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

// Mock the dashboardManager instance
jest.mock('../../pages/DashboardPage', () => {
  const originalModule = jest.requireActual('../../pages/DashboardPage');
  return {
    ...originalModule,
    dashboardManager: {
      getActiveWidgets: jest.fn().mockReturnValue([]),
      showWelcomeScreen: jest.fn().mockReturnValue(true),
      calculateOptimalLayout: jest.fn().mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: []
      })
    }
  };
});

const MockDashboardManager = DashboardManager as jest.MockedClass<typeof DashboardManager>;

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
        widgets: mockWidgets.map(widget => ({
          componentId: widget.id,
          position: widget.position || { x: 0, y: 0 },
          size: widget.size
        }))
      });

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-2')).toBeInTheDocument();
        expect(screen.getByText('Test Widget 1')).toBeInTheDocument();
        expect(screen.getByText('Test Widget 2')).toBeInTheDocument();
      });
    });

    it('should render widgets in a responsive grid container', async () => {
      const mockWidgets = [createMockWidget('widget-1', 'Test Widget')];
      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue(mockWidgets);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);
      (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets.map(widget => ({
          componentId: widget.id,
          position: widget.position || { x: 0, y: 0 },
          size: widget.size
        }))
      });

      renderDashboardPage();

      await waitFor(() => {
        const widgetContainer = screen.getByTestId('widget-widget-1').closest('.widget-container');
        expect(widgetContainer).toBeInTheDocument();
        expect(widgetContainer).toHaveClass('widget-container');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display graceful error state when dashboard fails to load', async () => {
      (dashboardManager.getActiveWidgets as jest.Mock).mockImplementation(() => {
        throw new Error('Dashboard load failed');
      });
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);

      renderDashboardPage();

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        // Should still show the page even if widgets fail to load
        expect(screen.getByText('Welcome to your NeutralApp dashboard')).toBeInTheDocument();
      });
    });

    it('should handle widget errors gracefully', async () => {
      const mockWidgets = [
        {
          ...createMockWidget('widget-1', 'Test Widget'),
          component: () => {
            throw new Error('Widget failed to render');
          }
        }
      ];

      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue(mockWidgets);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);
      (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: mockWidgets.map(widget => ({
          componentId: widget.id,
          position: widget.position || { x: 0, y: 0 },
          size: widget.size
        }))
      });

      renderDashboardPage();

      await waitFor(() => {
        // Should still render the dashboard even if individual widgets fail
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome to your NeutralApp dashboard')).toBeInTheDocument();
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
        const dashboardContent = screen.getByText('Dashboard').closest('.dashboard-content');
        
        expect(dashboardPage).toHaveClass('dashboard-page');
        expect(dashboardContent).toHaveClass('dashboard-content');
      });
    });

    it('should maintain proper spacing and layout structure', async () => {
      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);

      renderDashboardPage();

      await waitFor(() => {
        const widgetContainer = screen.getByText('No plugins installed yet').closest('.widget-container');
        expect(widgetContainer).toHaveClass('widget-container');
      });
    });
  });

  describe('Integration with DashboardManager', () => {
    it('should call DashboardManager methods on component mount', async () => {
      renderDashboardPage();

      await waitFor(() => {
        expect(dashboardManager.getActiveWidgets as jest.Mock).toHaveBeenCalled();
        expect(dashboardManager.showWelcomeScreen as jest.Mock).toHaveBeenCalled();
      });
    });

    it('should use DashboardManager layout calculations', async () => {
      const mockLayout = {
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: []
      };

      (dashboardManager.getActiveWidgets as jest.Mock).mockReturnValue([]);
      (dashboardManager.showWelcomeScreen as jest.Mock).mockReturnValue(false);
      (dashboardManager.calculateOptimalLayout as jest.Mock).mockReturnValue(mockLayout);

      renderDashboardPage();

      await waitFor(() => {
        expect(dashboardManager.calculateOptimalLayout as jest.Mock).toHaveBeenCalled();
      });
    });
  });
}); 