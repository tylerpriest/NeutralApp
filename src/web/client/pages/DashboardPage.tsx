import React, { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import WidgetFactory from '../components/WidgetFactory';

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '48px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #1a1a1a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '48px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#fef2f2',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          color: '#ef4444'
        }}>
          ⚠️
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 8px 0'
        }}>
          Failed to load dashboard
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 24px 0',
          maxWidth: '400px'
        }}>
          {error}. Please try refreshing the page.
        </p>
        <button
          onClick={loadDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
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
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          margin: '0 0 8px 0'
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0
        }}>
          Your installed plugins and widgets
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {widgets.map((widget) => (
          <div
            key={widget.id}
            style={{
              minHeight: '200px',
              gridColumn: `span ${widget.size.width}`,
              gridRow: `span ${widget.size.height}`
            }}
          >
            <WidgetFactory
              pluginId={widget.pluginId}
              title={widget.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 