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
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingSpinner } from '../../../shared/ui';
import ErrorReportingInterface from '../components/ErrorReportingInterface';
import {
  Activity,
  Users,
  Package,
  Monitor,
  UserCheck,
  FileText,
  AlertTriangle,
  Play,
  Square,
  Eye,
  UserX,
  UserPlus,
  Download,
  Settings,
  Shield,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
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
      // Cleanup monitoring interval will be handled by the component unmount
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
    // Set up real-time monitoring updates
    const monitoringInterval = setInterval(async () => {
      if (isMonitoring) {
        try {
          const [resources, performance, errors] = await Promise.all([
            systemMonitor.getResourceUsage(),
            systemMonitor.getPerformanceMetrics(),
            systemMonitor.getErrorRates()
          ]);
          
          setResourceUsage(resources);
          setPerformanceMetrics(performance);
          setErrorStats(errors);
        } catch (err) {
          console.error('Error updating monitoring data:', err);
        }
      }
    }, 30000); // Update every 30 seconds

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'enabled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
      case 'disabled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'enabled':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
      case 'disabled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-very-light p-6" role="main">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-dark mb-2">Admin Dashboard</h1>
            <p className="text-gray-medium mb-6">System monitoring and administration</p>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <p className="text-red-600 mb-6">{error}</p>
                             <Button onClick={loadAdminData} variant="default">
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Retry
               </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-very-light p-6" role="main">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-dark mb-2">Admin Dashboard</h1>
            <p className="text-gray-medium mb-6">System monitoring and administration</p>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-medium">Loading admin data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabData[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Activity className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemHealth && systemHealth.errors === 0 ? 'healthy' : 'warning')}
                    <span className="font-semibold">
                      {systemHealth && systemHealth.errors === 0 ? 'Healthy' : 'Warning'}
                    </span>
                  </div>
                </div>
                {systemHealth && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">CPU</span>
                      <span className="font-semibold">{Math.round(systemHealth.cpu * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Memory</span>
                      <span className="font-semibold">{Math.round(systemHealth.memory * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Disk</span>
                      <span className="font-semibold">{Math.round(systemHealth.disk * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Uptime</span>
                      <span className="font-semibold">{Math.floor(systemHealth.uptime / 3600)}h</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Total</span>
                      <span className="font-semibold">{userStats.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Active</span>
                      <span className="font-semibold">{userStats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Growth</span>
                      <span className="font-semibold text-green-600">+{userStats.userGrowth}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  Plugins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Installed</span>
                  <span className="font-semibold">{pluginHealth?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Active</span>
                  <span className="font-semibold">
                    {pluginHealth?.filter(p => p.status === PluginStatus.ENABLED).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-medium">Errors</span>
                  <span className="font-semibold text-red-600">
                    {pluginHealth?.reduce((total, p) => total + p.errors, 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'monitor',
      label: 'System Monitor',
      icon: <Monitor className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="flex gap-4">
                         <Button 
               onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
               variant={isMonitoring ? "secondary" : "default"}
               className="flex items-center gap-2"
             >
              {isMonitoring ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Monitoring
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resourceUsage && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">CPU Usage</span>
                      <span className="font-semibold">{Math.round(resourceUsage.cpu * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Memory Usage</span>
                      <span className="font-semibold">{Math.round(resourceUsage.memory * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Disk Usage</span>
                      <span className="font-semibold">{Math.round(resourceUsage.disk * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Network Usage</span>
                      <span className="font-semibold">{Math.round(resourceUsage.network * 100)}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Response Time</span>
                      <span className="font-semibold">{performanceMetrics.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Throughput</span>
                      <span className="font-semibold">{performanceMetrics.throughput} req/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Error Rate</span>
                      <span className="font-semibold">{Math.round(performanceMetrics.errorRate * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Availability</span>
                      <span className="font-semibold">{Math.round(performanceMetrics.availability * 100)}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  Error Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Total Errors</span>
                      <span className="font-semibold text-red-600">{errorStats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-medium">Recent Errors</span>
                      <span className="font-semibold">{errorStats.recent.length}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-dark">User List</h3>
          <div className="space-y-4">
            {users?.map(user => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-dark">{user.email}</div>
                      <div className="text-sm text-gray-medium">{user.displayName}</div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleViewUserDetails(user)}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handlePerformAdminAction(user.id, 'suspend_user')}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <UserX className="w-4 h-4" />
                        Suspend
                      </Button>
                      <Button 
                        onClick={() => handlePerformAdminAction(user.id, 'activate_user')}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        <UserPlus className="w-4 h-4" />
                        Activate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {showUserDetails && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    {selectedUser.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-gray-medium">Email:</span>
                    <p className="font-semibold">{selectedUser.email}</p>
                  </div>
                                     <Button 
                     onClick={() => setShowUserDetails(false)}
                     variant="default"
                     className="w-full"
                   >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'plugins',
      label: 'Plugin Management',
      icon: <Package className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-dark">Plugin Health</h3>
          <div className="space-y-4">
            {pluginHealth?.map(plugin => (
              <Card key={plugin.pluginId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-3">
                      <div className="font-semibold text-gray-dark">{plugin.pluginId}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full border ${getStatusColor(plugin.status)}`}>
                          {plugin.status}
                        </span>
                        <span className="text-gray-medium">
                          Performance: {Math.round(plugin.performance * 100)}%
                        </span>
                        <span className="text-red-600">
                          Errors: {plugin.errors}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {plugin.status === PluginStatus.ENABLED ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-dark">System Reports</h3>
          <div className="flex gap-4">
                         <Button 
               onClick={handleGenerateReport}
               disabled={isGeneratingReport}
               variant="default"
               className="flex items-center gap-2"
             >
              {isGeneratingReport ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            {reports?.map((report, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-dark">
                        {report.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleExportReport(report)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'errors',
      label: 'Error Reporting',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <ErrorReportingInterface />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-very-light p-6" role="main">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-dark mb-2">Admin Dashboard</h1>
          <p className="text-gray-medium">System monitoring and administration</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="border-b border-border">
            <div className="flex overflow-x-auto" role="tablist">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary bg-primary/5' 
                      : 'border-transparent text-gray-medium hover:text-gray-dark hover:bg-gray-50'
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6" role="tabpanel">
            {tabs.find(tab => tab.id === activeTab)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 