import React, { useState, useEffect } from 'react';
import { DashboardManager } from '../../../features/ui-shell/services/dashboard.manager';
import { DashboardWidget, DashboardLayout } from '../../../shared/types';
import WidgetContainer from '../components/WidgetContainer';
import WelcomeScreen from '../components/WelcomeScreen';
import { Button } from '../../../shared/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Use the global shared DashboardManager instance
  const dashboardManager = DashboardManager.getInstance();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch active widgets from API
        const response = await fetch('/api/dashboard/widgets');
        if (!response.ok) {
          throw new Error(`Failed to fetch widgets: ${response.status}`);
        }
        const data = await response.json();
        const activeWidgets = data.widgets || [];
        setWidgets(activeWidgets);

        // Check if we should show welcome screen
        const shouldShowWelcome = activeWidgets.length === 0;
        setShowWelcome(shouldShowWelcome);

        if (shouldShowWelcome) {
          // Don't set layout if showing welcome screen
          setLayout(null);
        } else if (activeWidgets.length > 0) {
          // Calculate optimal layout for widgets
          const optimalLayout = dashboardManager.calculateOptimalLayout(activeWidgets);
          setLayout(optimalLayout);
        } else {
          // Use default layout for empty state
          setLayout({
            grid: {
              columns: 12,
              rows: 8,
              gap: '16px',
              cellSize: { width: 100, height: 80 }
            },
            widgets: []
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleWidgetResize = (widgetId: string, size: any) => {
    // Update widget size in DashboardManager
    const updatedWidgets = widgets.map(widget => 
      widget.id === widgetId ? { ...widget, size } : widget
    );
    setWidgets(updatedWidgets);
    
    // Recalculate layout
    if (updatedWidgets.length > 0) {
      const newLayout = dashboardManager.calculateOptimalLayout(updatedWidgets);
      setLayout(newLayout);
    }
  };

  const handleWidgetMove = (widgetId: string, position: any) => {
    // Update widget position in DashboardManager
    const updatedWidgets = widgets.map(widget => 
      widget.id === widgetId ? { ...widget, position } : widget
    );
    setWidgets(updatedWidgets);
    
    // Recalculate layout
    if (updatedWidgets.length > 0) {
      const newLayout = dashboardManager.calculateOptimalLayout(updatedWidgets);
      setLayout(newLayout);
    }
  };

  // Show welcome screen if no plugins are installed
  if (showWelcome) {
    return <WelcomeScreen />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white border border-red-300 rounded-md p-8 text-center mt-8">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-md mt-8">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage your widgets and customize your workspace
          </p>
        </div>
        
        {layout && (
          <WidgetContainer
            widgets={widgets}
            layout={layout}
            onWidgetResize={handleWidgetResize}
            onWidgetMove={handleWidgetMove}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 