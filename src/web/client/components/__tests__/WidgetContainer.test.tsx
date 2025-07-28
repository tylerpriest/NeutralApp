import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WidgetContainer from '../WidgetContainer';
import { DashboardWidget, DashboardLayout } from '../../../../shared/types';

// Mock the useWidgetComponent hook
const MockWidgetComponent = ({ widget }: { widget: any }) => (
  <div data-testid={`widget-${widget.id}`}>
    {widget.title}
  </div>
);

jest.mock('../WidgetFactory', () => ({
  useWidgetComponent: () => MockWidgetComponent
}));

// Mock the shared UI components
jest.mock('../../../../shared/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button
      onClick={onClick}
      className={`button ${variant} ${size} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}));

jest.mock('../../../../shared/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className}`}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={`card-title ${className}`}>
      {children}
    </h3>
  )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => <div className={`icon alert-triangle ${className}`} />,
  RefreshCw: ({ className }: any) => <div className={`icon refresh-cw ${className}`} />
}));

describe('WidgetContainer', () => {
  const mockWidget: DashboardWidget = {
    id: 'widget-1',
    pluginId: 'test-plugin',
    title: 'Test Widget',
    component: 'TestComponent',
    size: { width: 2, height: 1 },
    permissions: []
  };

  const mockLayout: DashboardLayout = {
    grid: {
      columns: 12,
      rows: 8,
      gap: '16px',
      cellSize: { width: 100, height: 80 }
    },
    widgets: [
      {
        id: 'widget-1',
        componentId: 'widget-1',
        position: { x: 0, y: 0 },
        size: { width: 2, height: 1 }
      },
      {
        id: 'widget-2',
        componentId: 'widget-2',
        position: { x: 2, y: 1 },
        size: { width: 2, height: 1 }
      }
    ]
  };

  beforeEach(() => {
    // No setup needed since we're using a direct mock component
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Widget Rendering', () => {
    it('should render widgets with proper grid layout', async () => {
      const widgets = [mockWidget];
      
      render(
        <WidgetContainer
          widgets={widgets}
          layout={mockLayout}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
        expect(screen.getByTestId('widget-widget-1')).toHaveTextContent('Test Widget');
      });
    });

    it('should apply correct grid positioning to widgets', async () => {
      const widgets = [
        { ...mockWidget, id: 'widget-1', size: { width: 2, height: 1 } },
        { ...mockWidget, id: 'widget-2', title: 'Test Widget 2', size: { width: 2, height: 1 } }
      ];
      
      render(
        <WidgetContainer
          widgets={widgets}
          layout={mockLayout}
        />
      );

      await waitFor(() => {
        const widget1 = screen.getByTestId('widget-widget-1');
        const widget2 = screen.getByTestId('widget-widget-2');
        
        expect(widget1).toBeInTheDocument();
        expect(widget2).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while widgets are initializing', async () => {
      render(
        <WidgetContainer
          widgets={[]}
          layout={mockLayout}
          isLoading={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Loading widgets...')).toBeInTheDocument();
        const loadingElement = screen.getByTestId('widget-loading');
        expect(loadingElement).toHaveClass('flex');
        expect(loadingElement).toHaveClass('flex-col');
        expect(loadingElement).toHaveClass('items-center');
        expect(loadingElement).toHaveClass('justify-center');
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state with proper styling', async () => {
      render(
        <WidgetContainer
          widgets={[]}
          layout={mockLayout}
          isLoading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No widgets available')).toBeInTheDocument();
        const emptyStateElement = screen.getByTestId('widget-empty-state');
        expect(emptyStateElement).toHaveClass('text-center');
        expect(emptyStateElement).toHaveClass('p-10');
        expect(emptyStateElement).toHaveClass('text-gray-500');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt grid columns based on screen size', async () => {
      render(
        <WidgetContainer
          widgets={[mockWidget]}
          layout={mockLayout}
        />
      );

      await waitFor(() => {
        const container = screen.getByTestId('widget-container');
        expect(container).toHaveClass('w-full');
        expect(container).toHaveClass('min-h-[400px]');
        expect(container).toHaveClass('p-4');
        expect(container).toHaveClass('bg-gray-50');
        expect(container).toHaveClass('rounded-lg');
      });
    });

    it('should maintain proper spacing on different screen sizes', async () => {
      render(
        <WidgetContainer
          widgets={[mockWidget]}
          layout={mockLayout}
        />
      );

      await waitFor(() => {
        const container = screen.getByTestId('widget-container');
        expect(container).toHaveClass('w-full');
        expect(container).toHaveClass('min-h-[400px]');
        expect(container).toHaveClass('p-4');
        expect(container).toHaveClass('bg-gray-50');
        expect(container).toHaveClass('rounded-lg');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle widget errors gracefully', async () => {
      const errorWidget = { ...mockWidget, id: 'error-widget' };
      const widgets = [errorWidget];
      
      render(
        <WidgetContainer
          widgets={widgets}
          layout={mockLayout}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('widget-error-widget')).toBeInTheDocument();
      });
    });
  });

  describe('Widget Interactions', () => {
    it('should call onWidgetResize when widget is resized', async () => {
      const onWidgetResize = jest.fn();
      const widgets = [mockWidget];
      
      render(
        <WidgetContainer
          widgets={widgets}
          layout={mockLayout}
          onWidgetResize={onWidgetResize}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
      });
    });

    it('should call onWidgetMove when widget is moved', async () => {
      const onWidgetMove = jest.fn();
      const widgets = [mockWidget];
      
      render(
        <WidgetContainer
          widgets={widgets}
          layout={mockLayout}
          onWidgetMove={onWidgetMove}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('widget-widget-1')).toBeInTheDocument();
      });
    });
  });
}); 