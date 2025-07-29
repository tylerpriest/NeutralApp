import React, { useState, useCallback } from 'react';
import { DashboardWidget, DashboardLayout, WidgetSize, WidgetPosition } from '../../../shared/types';
import WidgetFactory from './WidgetFactory';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WidgetContainerProps {
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isLoading?: boolean;
  onWidgetResize?: (widgetId: string, size: WidgetSize) => void;
  onWidgetMove?: (widgetId: string, position: WidgetPosition) => void;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  widgetId?: string;
}

class WidgetErrorBoundary extends React.Component<
  { widget: DashboardWidget; children: React.ReactNode },
  WidgetErrorBoundaryState
> {
  constructor(props: { widget: DashboardWidget; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-4" data-testid="widget-error">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-red-700 mb-2">Widget Error</h4>
            <p className="text-xs text-red-600 mb-3">This widget encountered an error and could not be displayed.</p>
            <Button 
              onClick={this.handleRetry}
              size="sm"
              variant="destructive"
              className="text-xs"
              data-testid="widget-error-retry"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgets,
  layout,
  isLoading = false,
  onWidgetResize,
  onWidgetMove
}) => {
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

  const handleWidgetError = useCallback((widgetId: string) => {
    setErrorStates(prev => ({ ...prev, [widgetId]: true }));
  }, []);

  const handleWidgetRetry = useCallback((widgetId: string) => {
    setErrorStates(prev => ({ ...prev, [widgetId]: false }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500" data-testid="widget-loading">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p>Loading widgets...</p>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center p-10 text-gray-500" data-testid="widget-empty-state">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No widgets available</h3>
        <p className="text-sm">Install plugins to add widgets to your dashboard.</p>
      </div>
    );
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.grid.columns}, 1fr)`,
    gap: layout.grid.gap,
    padding: '16px'
  };

  return (
    <div className="w-full min-h-[400px] p-4 bg-gray-50 rounded-lg" data-testid="widget-container">
      <div className="widget-grid" style={gridStyle}>
        {widgets.map((widget) => (
          <Card
            key={widget.id}
            className={`
              bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden
              transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5
              ${errorStates[widget.id] ? 'border-red-300 bg-red-50' : ''}
            `}
            style={{
              gridColumn: `span ${widget.size?.width || 1}`,
              gridRow: `span ${widget.size?.height || 1}`
            }}
          >
            <CardHeader className="p-3 bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-sm font-semibold text-gray-700 m-0">
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-full flex flex-col">
              <WidgetErrorBoundary widget={widget}>
                <div className="flex-1 overflow-auto">
                  <WidgetFactory 
                    pluginId={widget.pluginId} 
                    title={widget.title}
                  />
                </div>
              </WidgetErrorBoundary>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WidgetContainer; 