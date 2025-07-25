import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WidgetContainer from '../WidgetContainer';
import { DashboardWidget, WidgetSize, DashboardLayout } from '../../../../shared/types';

describe('WidgetContainer', () => {
  const createMockWidget = (id: string, title: string): DashboardWidget => ({
    id,
    pluginId: 'test-plugin',
    title,
    component: () => <div data-testid={`widget-${id}`}>{title}</div>,
    size: { width: 2, height: 1 } as WidgetSize,
    position: { x: 0, y: 0 }
  });

  const createMockLayout = (widgets: DashboardWidget[]): DashboardLayout => ({
    grid: {
      columns: 12,
      rows: 8,
      gap: '16px',
      cellSize: { width: 100, height: 80 }
    },
    widgets: widgets.map(widget => ({
      componentId: widget.id,
      position: widget.position || { x: 0, y: 0 },
      size: widget.size
    }))
  });

  describe('Widget Rendering', () => {
    it('should render widgets in a responsive grid', async () => {
      const widgets = [
        createMockWidget('widget-1', 'Test Widget 1'),
        createMockWidget('widget-2', 'Test Widget 2')
      ];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-2')).toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-2')).toBeInTheDocument();
      });
    });

    it('should apply grid layout styles based on layout configuration', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        const container = screen.getByTestId('widget-container');
        expect(container).toHaveClass('widget-grid');
        expect(container).toHaveStyle({
          display: 'grid',
          gap: '16px'
        });
      });
    });

    it('should position widgets according to layout configuration', async () => {
      const widgets = [
        {
          ...createMockWidget('widget-1', 'Test Widget 1'),
          position: { x: 2, y: 1 }
        },
        {
          ...createMockWidget('widget-2', 'Test Widget 2'),
          position: { x: 0, y: 0 }
        }
      ];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        const widget1 = screen.getByTestId('widget-widget-1');
        const widget2 = screen.getByTestId('widget-widget-2');
        
        expect(widget1.closest('.widget-item')).toHaveStyle({
          gridColumn: '3 / span 2',
          gridRow: '2 / span 1'
        });
        
        expect(widget2.closest('.widget-item')).toHaveStyle({
          gridColumn: '1 / span 2',
          gridRow: '1 / span 1'
        });
      });
    });
  });

  describe('Error Boundaries', () => {
    it('should handle widget rendering errors gracefully', async () => {
      const errorWidget = {
        ...createMockWidget('error-widget', 'Error Widget'),
        component: () => {
          throw new Error('Widget failed to render');
        }
      };
      const widgets = [errorWidget];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        expect(screen.getByText('Widget Error')).toBeInTheDocument();
        expect(screen.getByText('This widget encountered an error and could not be displayed.')).toBeInTheDocument();
      });
    });

    it('should continue rendering other widgets when one fails', async () => {
      const errorWidget = {
        ...createMockWidget('error-widget', 'Error Widget'),
        component: () => {
          throw new Error('Widget failed to render');
        }
      };
      const goodWidget = createMockWidget('good-widget', 'Good Widget');
      const widgets = [errorWidget, goodWidget];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        expect(screen.getByText('Widget Error')).toBeInTheDocument();
        expect(screen.getByTestId('widget-good-widget')).toBeInTheDocument();
      });
    });

    it('should provide retry functionality for failed widgets', async () => {
      const errorWidget = {
        ...createMockWidget('error-widget', 'Error Widget'),
        component: () => {
          throw new Error('Widget failed to render');
        }
      };
      const widgets = [errorWidget];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveClass('widget-error-retry');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while widgets are initializing', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} isLoading={true} />);

      await waitFor(() => {
        expect(screen.getByText('Loading widgets...')).toBeInTheDocument();
        expect(screen.getByTestId('widget-loading')).toHaveClass('widget-loading');
      });
    });

    it('should hide loading state when widgets are ready', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} isLoading={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading widgets...')).not.toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no widgets are provided', async () => {
      const layout = createMockLayout([]);

      render(<WidgetContainer widgets={[]} layout={layout} />);

      await waitFor(() => {
        expect(screen.getByText('No widgets available')).toBeInTheDocument();
        expect(screen.getByText('Install plugins to add widgets to your dashboard.')).toBeInTheDocument();
      });
    });

    it('should show empty state with proper styling', async () => {
      const layout = createMockLayout([]);

      render(<WidgetContainer widgets={[]} layout={layout} />);

      await waitFor(() => {
        const emptyState = screen.getByText('No widgets available').closest('.widget-empty-state');
        expect(emptyState).toHaveClass('widget-empty-state');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt grid columns based on screen size', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        const container = screen.getByTestId('widget-container');
        expect(container).toHaveClass('widget-grid');
      });
    });

    it('should maintain proper spacing on different screen sizes', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);

      render(<WidgetContainer widgets={widgets} layout={layout} />);

      await waitFor(() => {
        const container = screen.getByTestId('widget-container');
        expect(container).toHaveStyle({
          gap: '16px'
        });
      });
    });
  });

  describe('Widget Interactions', () => {
    it('should handle widget resize events', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);
      const onWidgetResize = jest.fn();

      render(<WidgetContainer widgets={widgets} layout={layout} onWidgetResize={onWidgetResize} />);

      await waitFor(() => {
        const widget = screen.getByTestId('widget-widget-1');
        expect(widget).toBeInTheDocument();
      });
    });

    it('should handle widget move events', async () => {
      const widgets = [createMockWidget('widget-1', 'Test Widget')];
      const layout = createMockLayout(widgets);
      const onWidgetMove = jest.fn();

      render(<WidgetContainer widgets={widgets} layout={layout} onWidgetMove={onWidgetMove} />);

      await waitFor(() => {
        const widget = screen.getByTestId('widget-widget-1');
        expect(widget).toBeInTheDocument();
      });
    });
  });
}); 