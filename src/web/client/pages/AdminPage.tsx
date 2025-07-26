import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '../../../features/admin/services/admin.dashboard';
import { SystemMonitor } from '../../../features/admin/services/system.monitor';
import { UserManager } from '../../../features/admin/services/user.manager';
import { SystemReportGenerator } from '../../../features/admin/services/system.report.generator';
import {
  SystemHealthMetrics,
  UserStatistics,
  PluginHealthStatus,
  ResourceMetrics,
  PerformanceData,
  ErrorStatistics,
  SystemReport,
  UserProfile,
  AdminAction,
  SystemAlert,
  PluginStatus
} from '../../../shared/types';
import './AdminPage.css';

interface TabData {
  id: string;
  label: string;
  content: React.ReactNode;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Overview data
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [pluginHealth, setPluginHealth] = useState<PluginHealthStatus[]>([]);
  
  // System monitor data
  const [resourceUsage, setResourceUsage] = useState<ResourceMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceData | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  // User management data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Reports data
  const [reports, setReports] = useState<SystemReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Service instances
  const adminDashboard = new AdminDashboard();
  const systemMonitor = new SystemMonitor();
  const userManager = new UserManager();
  const reportGenerator = new SystemReportGenerator();

  useEffect(() => {
    loadAdminData();
    setupMonitoring();
    
    return () => {
      systemMonitor.destroy();
    };
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [health, stats, plugins, resources, performance, errors, userList] = await Promise.all([
        adminDashboard.getSystemHealth(),
        adminDashboard.getUserStatistics(),
        adminDashboard.getPluginHealth(),
        systemMonitor.getResourceUsage(),
        systemMonitor.getPerformanceMetrics(),
        systemMonitor.getErrorRates(),
        userManager.getUserProfiles()
      ]);
      
      setSystemHealth(health);
      setUserStats(stats);
      setPluginHealth(plugins);
      setResourceUsage(resources);
      setPerformanceMetrics(performance);
      setErrorStats(errors);
      setUsers(userList);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupMonitoring = () => {
    systemMonitor.subscribeToAlerts((alert: SystemAlert) => {
      // Handle system alerts
      console.log('System alert:', alert);
    });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleStartMonitoring = () => {
    systemMonitor.startMonitoring();
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    systemMonitor.stopMonitoring();
    setIsMonitoring(false);
  };

  const handleViewUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handlePerformAdminAction = async (userId: string, actionType: string) => {
    try {
      const action: AdminAction = {
        type: actionType,
        description: `${actionType} action performed by admin`,
        confirmation: true
      };
      await userManager.performAdminAction(userId, action);
      await loadAdminData(); // Refresh data
    } catch (err) {
      console.error('Failed to perform admin action:', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const report = await reportGenerator.generateBasicReport();
      setReports(prev => [report, ...prev]);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportReport = async (report: SystemReport) => {
    try {
      // For now, just log the export action since the interface expects DetailedSystemReport
      console.log('Exporting report:', report);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  if (error) {
    return (
      <div className="admin-page" role="main">
        <div className="admin-content">
          <h1>Admin Dashboard</h1>
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadAdminData} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="admin-page" role="main">
        <div className="admin-content">
          <h1>Admin Dashboard</h1>
          <p>System monitoring and administration</p>
          <div className="loading-state">
            <div className="loading-spinner" data-testid="loading-spinner"></div>
            <p>Loading admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabData[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="overview-content">
          <div className="admin-grid">
            <div className="admin-card">
              <h3>System Health</h3>
              <p>Status: {systemHealth && systemHealth.errors === 0 ? 'Healthy' : 'Warning'}</p>
              {systemHealth && (
                <div className="metrics">
                  <p>CPU: {Math.round(systemHealth.cpu * 100)}%</p>
                  <p>Memory: {Math.round(systemHealth.memory * 100)}%</p>
                  <p>Disk: {Math.round(systemHealth.disk * 100)}%</p>
                  <p>Uptime: {Math.floor(systemHealth.uptime / 3600)}h</p>
                </div>
              )}
            </div>
            <div className="admin-card">
              <h3>Users</h3>
              {userStats && (
                <div className="metrics">
                  <p>Total: {userStats.totalUsers}</p>
                  <p>Active: {userStats.activeUsers}</p>
                  <p>Growth: +{userStats.userGrowth}%</p>
                </div>
              )}
            </div>
            <div className="admin-card">
              <h3>Plugins</h3>
              <div className="metrics">
                <p>Installed: {pluginHealth?.length || 0}</p>
                <p>Active: {pluginHealth?.filter(p => p.status === PluginStatus.ENABLED).length || 0}</p>
                <p>Errors: {pluginHealth?.reduce((total, p) => total + p.errors, 0) || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'monitor',
      label: 'System Monitor',
      content: (
        <div className="monitor-content">
          <div className="monitor-controls">
            <button 
              onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
              className="monitor-button"
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
          
          <div className="monitor-grid">
            <div className="monitor-card">
              <h3>Resource Usage</h3>
              {resourceUsage && (
                <div className="metrics">
                  <p>CPU Usage: {Math.round(resourceUsage.cpu * 100)}%</p>
                  <p>Memory Usage: {Math.round(resourceUsage.memory * 100)}%</p>
                  <p>Disk Usage: {Math.round(resourceUsage.disk * 100)}%</p>
                  <p>Network Usage: {Math.round(resourceUsage.network * 100)}%</p>
                </div>
              )}
            </div>
            
            <div className="monitor-card">
              <h3>Performance Metrics</h3>
              {performanceMetrics && (
                <div className="metrics">
                  <p>Response Time: {performanceMetrics.responseTime}ms</p>
                  <p>Throughput: {performanceMetrics.throughput} req/s</p>
                  <p>Error Rate: {Math.round(performanceMetrics.errorRate * 100)}%</p>
                  <p>Availability: {Math.round(performanceMetrics.availability * 100)}%</p>
                </div>
              )}
            </div>
            
            <div className="monitor-card">
              <h3>Error Statistics</h3>
              {errorStats && (
                <div className="metrics">
                  <p>Total Errors: {errorStats.total}</p>
                  <p>Recent Errors: {errorStats.recent.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      label: 'User Management',
      content: (
        <div className="users-content">
          <h3>User List</h3>
          <div className="user-list">
            {users?.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <span className="email">{user.email}</span>
                  <span className="display-name">{user.displayName}</span>
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => handleViewUserDetails(user)}
                    className="action-button"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handlePerformAdminAction(user.id, 'suspend_user')}
                    className="action-button suspend"
                  >
                    Suspend
                  </button>
                  <button 
                    onClick={() => handlePerformAdminAction(user.id, 'activate_user')}
                    className="action-button activate"
                  >
                    Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {showUserDetails && selectedUser && (
            <div className="user-details-modal">
              <div className="modal-content">
                <h3>{selectedUser.displayName}</h3>
                <p>Email: {selectedUser.email}</p>
                <button onClick={() => setShowUserDetails(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'plugins',
      label: 'Plugin Management',
      content: (
        <div className="plugins-content">
          <h3>Plugin Health</h3>
          <div className="plugin-list">
            {pluginHealth?.map(plugin => (
              <div key={plugin.pluginId} className="plugin-item">
                <div className="plugin-info">
                  <span className="plugin-name">{plugin.pluginId}</span>
                  <span className={`status ${plugin.status.toLowerCase()}`}>
                    {plugin.status}
                  </span>
                  <span className="performance">
                    Performance: {Math.round(plugin.performance * 100)}%
                  </span>
                  <span className="errors">
                    Errors: {plugin.errors}
                  </span>
                </div>
                <div className="plugin-actions">
                  <button className="action-button">
                    {plugin.status === PluginStatus.ENABLED ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      content: (
        <div className="reports-content">
          <h3>System Reports</h3>
          <div className="reports-controls">
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="generate-button"
            >
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
          
          <div className="reports-list">
            {reports?.map((report, index) => (
              <div key={index} className="report-item">
                <div className="report-info">
                  <span className="report-date">
                    {report.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <div className="report-actions">
                  <button 
                    onClick={() => handleExportReport(report)}
                    className="action-button"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page" role="main">
      <div className="admin-content">
        <h1>Admin Dashboard</h1>
        <p>System monitoring and administration</p>
        
        <div className="admin-tabs">
          <div className="tab-list" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="tab-content" role="tabpanel">
            {tabs.find(tab => tab.id === activeTab)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 