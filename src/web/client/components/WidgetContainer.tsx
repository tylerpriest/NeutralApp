import React, { useState, useCallback } from 'react';
import { DashboardWidget, DashboardLayout, WidgetSize, WidgetPosition } from '../../../shared/types';
import './WidgetContainer.css';

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
        <div className="widget-error" data-testid="widget-error">
          <div className="widget-error-content">
            <h4>Widget Error</h4>
            <p>This widget encountered an error and could not be displayed.</p>
            <button 
              className="widget-error-retry" 
              onClick={this.handleRetry}
              data-testid="widget-error-retry"
            >
              Retry
            </button>
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
      <div className="widget-loading" data-testid="widget-loading">
        <div className="loading-spinner"></div>
        <p>Loading widgets...</p>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="widget-empty-state" data-testid="widget-empty-state">
        <h3>No widgets available</h3>
        <p>Install plugins to add widgets to your dashboard.</p>
      </div>
    );
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.grid.columns}, 1fr)`,
    gap: layout.grid.gap,
    gridTemplateRows: layout.grid.rows ? `repeat(${layout.grid.rows}, 1fr)` : 'auto'
  };

  return (
    <div 
      className="widget-grid" 
      style={gridStyle}
      data-testid="widget-container"
    >
      {widgets.map((widget) => {
        const layoutItem = layout.widgets.find(item => item.componentId === widget.id);
        const isError = errorStates[widget.id];

        if (isError) {
          return (
            <div
              key={widget.id}
              className="widget-item widget-error-item"
              style={{
                gridColumn: layoutItem ? `${layoutItem.position.x + 1} / span ${layoutItem.size.width}` : '1 / span 2',
                gridRow: layoutItem ? `${layoutItem.position.y + 1} / span ${layoutItem.size.height}` : '1 / span 1'
              }}
            >
              <div className="widget-error" data-testid="widget-error">
                <div className="widget-error-content">
                  <h4>Widget Error</h4>
                  <p>This widget encountered an error and could not be displayed.</p>
                  <button 
                    className="widget-error-retry" 
                    onClick={() => handleWidgetRetry(widget.id)}
                    data-testid="widget-error-retry"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={widget.id}
            className="widget-item"
            style={{
              gridColumn: layoutItem ? `${layoutItem.position.x + 1} / span ${layoutItem.size.width}` : '1 / span 2',
              gridRow: layoutItem ? `${layoutItem.position.y + 1} / span ${layoutItem.size.height}` : '1 / span 1'
            }}
          >
            <WidgetErrorBoundary widget={widget}>
              <div className="widget-content">
                <div className="widget-header">
                  <h3 className="widget-title">{widget.title}</h3>
                </div>
                <div className="widget-body">
                  <widget.component />
                </div>
              </div>
            </WidgetErrorBoundary>
          </div>
        );
      })}
    </div>
  );
};

export default WidgetContainer; 