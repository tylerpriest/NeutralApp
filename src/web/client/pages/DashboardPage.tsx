import React, { useEffect, useState } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';

interface Widget {
  id: string;
  type: string;
  title: string;
  content: string;
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
      
      const response = await fetch('/api/dashboard/widgets');
      if (!response.ok) {
        throw new Error('Failed to fetch widgets');
      }
      
      const data = await response.json();
      setWidgets(data.widgets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
            borderTop: '3px solid #6b7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>Loading dashboard...</p>
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

  // If widgets exist, show dashboard grid
  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {widgets.map((widget) => (
          <div
            key={widget.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0 0 16px 0'
            }}>
              {widget.title}
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              {widget.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 