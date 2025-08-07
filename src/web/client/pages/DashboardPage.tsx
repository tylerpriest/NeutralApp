import React, { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import EnhancedWidgetFactory from '../components/EnhancedWidgetFactory';

interface Widget {
  id: string;
  pluginId: string;
  title: string;
  size: { width: number; height: number };
}

const DashboardPage: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load widgets from API
      try {
        const response = await fetch('/api/plugins');
        if (response.ok) {
          const data = await response.json();
          const installedPlugins = data.installed || [];
          
          // Create widgets for enabled plugins
          const dashboardWidgets: Widget[] = [];
          
          for (const plugin of installedPlugins.filter((plugin: any) => plugin.status === 'enabled')) {
            // Special handling for reading-core plugin which creates multiple widgets
            if (plugin.id === 'reading-core') {
              // Add library widget
              dashboardWidgets.push({
                id: 'reading-core-library',
                pluginId: 'reading-core',
                title: 'Book Library',
                size: { width: 4, height: 3 }
              });
              
              // Add recently read widget
              dashboardWidgets.push({
                id: 'reading-core-recent',
                pluginId: 'reading-core-recent',
                title: 'Recently Read',
                size: { width: 2, height: 2 }
              });
            } else if (plugin.id.startsWith('reading-')) {
              // Handle other reading plugins
              dashboardWidgets.push({
                id: `${plugin.id}-widget`,
                pluginId: plugin.id,
                title: `${plugin.name} Widget`,
                size: { width: 2, height: 2 }
              });
            } else {
              // Default widget for other plugins
              dashboardWidgets.push({
                id: `${plugin.id}-widget`,
                pluginId: plugin.id,
                title: `${plugin.name} Widget`,
                size: { width: 2, height: 1 }
              });
            }
          }
          
          setWidgets(dashboardWidgets);
          return;
        }
      } catch (error) {
        console.warn('Failed to load widgets from API, using mock data:', error);
      }
      
      // Fallback to mock data - check localStorage for installed plugins
      const installedPlugins = JSON.parse(localStorage.getItem('installed_plugins') || '[]');
      const mockWidgets: Widget[] = [];
      
      for (const plugin of installedPlugins.filter((plugin: any) => plugin.enabled)) {
        // Special handling for reading-core plugin which creates multiple widgets
        if (plugin.id === 'reading-core') {
          // Add library widget
          mockWidgets.push({
            id: 'reading-core-library',
            pluginId: 'reading-core',
            title: 'Book Library',
            size: { width: 4, height: 3 }
          });
          
          // Add recently read widget
          mockWidgets.push({
            id: 'reading-core-recent',
            pluginId: 'reading-core-recent',
            title: 'Recently Read',
            size: { width: 2, height: 2 }
          });
        } else if (plugin.id.startsWith('reading-')) {
          // Handle other reading plugins
          mockWidgets.push({
            id: `${plugin.id}-widget`,
            pluginId: plugin.id,
            title: `${plugin.name} Widget`,
            size: { width: 2, height: 2 }
          });
        } else {
          // Default widget for other plugins
          mockWidgets.push({
            id: `${plugin.id}-widget`,
            pluginId: plugin.id,
            title: `${plugin.name} Widget`,
            size: { width: 2, height: 1 }
          });
        }
      }
      
      setWidgets(mockWidgets);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-gray-light border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 bg-error-light rounded-2xl flex items-center justify-center mb-6 text-error text-2xl">
          ⚠️
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-sm text-gray-medium mb-6 max-w-sm">
          {error}. Please try refreshing the page.
        </p>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-fast hover:bg-primary/90"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  // If no widgets, show welcome screen
  if (widgets.length === 0) {
    return <WelcomeScreen />;
  }

  // Show widgets in a grid layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Your installed plugins and widgets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgets.map((widget) => {
            // Determine size based on widget dimensions
            const getWidgetSize = (width: number, height: number) => {
              if (width >= 4 || height >= 3) return 'large';
              if (width >= 2 || height >= 2) return 'medium';
              return 'small';
            };

            const widgetSize = getWidgetSize(widget.size.width, widget.size.height);
            const gridSpan = widget.size.width >= 2 ? 'md:col-span-2' : '';
            
            return (
              <div
                key={widget.id}
                className={`${gridSpan} ${
                  widget.size.width >= 4 ? 'lg:col-span-2 xl:col-span-2' : ''
                }`}
              >
                <EnhancedWidgetFactory
                  pluginId={widget.pluginId}
                  title={widget.title}
                  size={widgetSize}
                  onConfigure={() => {
                    // TODO: Implement plugin configuration
                    console.log('Configure plugin:', widget.pluginId);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 