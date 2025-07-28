import React, { useState, useEffect } from 'react';
import { DashboardManager } from '../../../features/ui-shell/services/dashboard.manager';
import { DashboardWidget, DashboardLayout } from '../../../shared/types';
import WidgetContainer from '../components/WidgetContainer';
import WelcomeScreen from '../components/WelcomeScreen';
import './DashboardPage.css';

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
      <div className="dashboard-page">
        <div className="dashboard-content">
          <h1>Dashboard</h1>
          <div className="dashboard-error">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="dashboard-error-retry"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <h1>Dashboard</h1>
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard with widgets
  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome to your NeutralApp dashboard</p>
        
        {layout && (
          <WidgetContainer
            widgets={widgets}
            layout={layout}
            isLoading={isLoading}
            onWidgetResize={handleWidgetResize}
            onWidgetMove={handleWidgetMove}
          />
        )}
      </div>
    </div>
  );
};

// Remove the local dashboardManager export and use the global instance
export default DashboardPage; 