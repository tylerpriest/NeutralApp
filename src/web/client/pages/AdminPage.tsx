import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Settings, AlertTriangle, Package, FileText } from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = () => {
    // Mock data
    const mockMetrics: SystemMetric[] = [
      {
        id: '1',
        name: 'CPU Usage',
        value: '45',
        unit: '%',
        status: 'good',
        trend: 'stable'
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: '78',
        unit: '%',
        status: 'warning',
        trend: 'up'
      },
      {
        id: '3',
        name: 'Disk Space',
        value: '92',
        unit: '%',
        status: 'error',
        trend: 'up'
      },
      {
        id: '4',
        name: 'Active Users',
        value: '156',
        unit: '',
        status: 'good',
        trend: 'up'
      }
    ];

    const mockActivities: UserActivity[] = [
      {
        id: '1',
        user: 'admin@neutralapp.com',
        action: 'Plugin installed: Weather Widget',
        timestamp: '2 minutes ago',
        status: 'success'
      },
      {
        id: '2',
        user: 'guest@neutralapp.com',
        action: 'Login attempt failed',
        timestamp: '5 minutes ago',
        status: 'warning'
      },
      {
        id: '3',
        user: 'system',
        action: 'Database backup completed',
        timestamp: '1 hour ago',
        status: 'success'
      },
      {
        id: '4',
        user: 'admin@neutralapp.com',
        action: 'Settings updated',
        timestamp: '2 hours ago',
        status: 'success'
      }
    ];

    setMetrics(mockMetrics);
    setActivities(mockActivities);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'success':
        return '#059669';
      case 'warning':
        return '#d97706';
      case 'error':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'success':
        return '#d1fae5';
      case 'warning':
        return '#fef3c7';
      case 'error':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const renderOverview = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 24px 0'
      }}>
        System Health
      </h2>
      
      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div 
          data-testid="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            margin: '0 0 16px 0'
          }}>
            Resource Usage
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            CPU: 45%, Memory: 78%, Disk: 92%
          </p>
        </div>
        
        <div 
          data-testid="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            margin: '0 0 16px 0'
          }}>
            Performance Metrics
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Response time: 120ms, Throughput: 1.2k req/s
          </p>
        </div>
        
        <div 
          data-testid="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            margin: '0 0 16px 0'
          }}>
            Error Statistics
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Errors: 2, Warnings: 5, Success rate: 98.5%
          </p>
        </div>
        
        <div 
          data-testid="card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            margin: '0 0 16px 0'
          }}>
            Plugins
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Active: 8, Total: 12, Health: Good
          </p>
        </div>
      </div>
          
      {/* Recent Activity */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 16px 0'
        }}>
          Recent Activity
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(activity.status)
                }} />
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1a1a1a',
                    margin: '0 0 2px 0'
                  }}>
                    {activity.action}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 24px 0'
      }}>
        User Management
      </h2>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          margin: '48px 0'
        }}>
          User List
        </p>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 24px 0'
      }}>
        System Monitor
      </h2>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Stop Monitoring
        </button>
      </div>
    </div>
  );

  const renderPlugins = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 24px 0'
      }}>
        Plugin Health
      </h2>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          margin: '48px 0'
        }}>
          Plugin management features coming soon
        </p>
      </div>
    </div>
  );

  const renderReports = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 24px 0'
      }}>
        System Reports
      </h2>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#059669',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Generate Report
        </button>
      </div>
    </div>
  );

  const renderErrors = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 24px 0'
      }}>
        Error Logs
      </h2>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          margin: '48px 0'
        }}>
          Error reporting features coming soon
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'system', label: 'System', icon: <Settings size={20} /> },
    { id: 'plugins', label: 'Plugin Management', icon: <Package size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'errors', label: 'Error Reporting', icon: <AlertTriangle size={20} /> }
  ];

  return (
    <main 
      role="main"
      className="min-h-screen bg-gray-very-light"
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: '#fafafa'
      }}
    >
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: '24px 0'
      }}>
        <div style={{
          padding: '0 24px 24px 24px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <Shield size={24} style={{ color: '#1a1a1a' }} data-testid="shield-icon" />
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: 0
            }}>
              Admin
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            System administration and monitoring
          </p>
        </div>
        
        <nav role="tablist">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                color: activeTab === tab.id ? '#1a1a1a' : '#6b7280'
              }}>
                {tab.icon}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === tab.id ? '#1a1a1a' : '#374151'
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
          
      {/* Content */}
      <div 
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        style={{
          flex: 1,
          backgroundColor: '#ffffff'
        }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'system' && renderSystem()}
        {activeTab === 'plugins' && renderPlugins()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'errors' && renderErrors()}
      </div>
    </main>
  );
};

export default AdminPage; 