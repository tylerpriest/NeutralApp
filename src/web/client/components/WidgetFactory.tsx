import React from 'react';
import { DashboardWidget } from '../../../shared/types';

// Default widget component for plugins that don't provide custom components
const DefaultWidgetComponent: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  return (
    <div className="default-widget">
      <div className="default-widget-content">
        <h4>{widget.title}</h4>
        <p>Plugin: {widget.pluginId}</p>
        <p>This is a default widget for {widget.title}.</p>
        <p>Plugin-specific content will be loaded here.</p>
      </div>
    </div>
  );
};

// Hello World specific widget component
const HelloWorldWidgetComponent: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const [timestamp, setTimestamp] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hello-world-widget">
      <div className="hello-world-content">
        <h4>Hello World!</h4>
        <p>Current time: {timestamp.toLocaleTimeString()}</p>
        <p>This widget is from the {widget.pluginId} plugin.</p>
      </div>
    </div>
  );
};

// Widget component registry
const widgetComponents: Record<string, React.ComponentType<{ widget: DashboardWidget }>> = {
  'Demo Hello WorldComponent': HelloWorldWidgetComponent,
  'HelloWorldComponent': HelloWorldWidgetComponent,
  'default': DefaultWidgetComponent
};

// Widget factory function
export const createWidgetComponent = (widget: DashboardWidget): React.ComponentType<{ widget: DashboardWidget }> => {
  // Try to find a specific component for this widget
  const specificComponent = widgetComponents[widget.component];
  if (specificComponent) {
    return specificComponent;
  }

  // Try to find a component by plugin ID
  const pluginComponent = widgetComponents[`${widget.pluginId}Component`];
  if (pluginComponent) {
    return pluginComponent;
  }

  // Fall back to default component
  return widgetComponents.default || DefaultWidgetComponent;
};

// Hook to get widget component
export const useWidgetComponent = (widget: DashboardWidget) => {
  return React.useMemo(() => createWidgetComponent(widget), [widget.component, widget.pluginId]);
};

export default createWidgetComponent; 