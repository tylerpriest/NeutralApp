import React, { useState, useEffect } from 'react';
import { PluginInfo, PluginStatus, InstallResult } from '../../../shared/types';
import { Button, Input, Card, CardHeader, CardContent, LoadingSpinner } from '../../../shared/ui';
import { 
  Search, 
  Download, 
  Trash2, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Shield, 
  Star,
  Eye,
  EyeOff,
  Package,
  Info,
  ExternalLink,
  Filter
} from 'lucide-react';

const PluginManagerPage: React.FC = () => {
  const [availablePlugins, setAvailablePlugins] = useState<PluginInfo[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<PluginInfo[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installingPlugins, setInstallingPlugins] = useState<Set<string>>(new Set());
  const [showUninstallDialog, setShowUninstallDialog] = useState<string | null>(null);
  const [showDependencyDialog, setShowDependencyDialog] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'installed' | 'available'>('all');

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [availablePlugins, installedPlugins, searchTerm, filterType]);

  const loadPlugins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plugins');
      if (!response.ok) {
        throw new Error('Failed to load plugins');
      }
      
      const data = await response.json();
      setAvailablePlugins(data.available || []);
      setInstalledPlugins(data.installed || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plugins');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlugins = () => {
    let basePlugins: PluginInfo[] = [];
    
    switch (filterType) {
      case 'installed':
        basePlugins = installedPlugins;
        break;
      case 'available':
        basePlugins = availablePlugins;
        break;
      default:
        basePlugins = [...installedPlugins, ...availablePlugins];
    }

    if (!searchTerm.trim()) {
      setFilteredPlugins(basePlugins);
      return;
    }

    const filtered = basePlugins.filter(plugin =>
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPlugins(filtered);
  };

  const handleInstallPlugin = async (plugin: PluginInfo) => {
    try {
      setInstallingPlugins(prev => new Set(prev).add(plugin.id));

      const response = await fetch('/api/plugins/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pluginId: plugin.id,
          version: plugin.version
        })
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: `${plugin.name} installed successfully` });
        await loadPlugins(); // Refresh the lists
      } else {
        setNotification({ type: 'error', message: result.error || 'Installation failed' });
      }
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Installation failed' 
      });
    } finally {
      setInstallingPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(plugin.id);
        return newSet;
      });
    }
  };

  const handleEnablePlugin = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Plugin enabled successfully' });
        await loadPlugins();
      } else {
        const result = await response.json();
        setNotification({ type: 'error', message: result.error || 'Failed to enable plugin' });
      }
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to enable plugin' 
      });
    }
  };

  const handleDisablePlugin = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Plugin disabled successfully' });
        await loadPlugins();
      } else {
        const result = await response.json();
        setNotification({ type: 'error', message: result.error || 'Failed to disable plugin' });
      }
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to disable plugin' 
      });
    }
  };

  const handleUninstallPlugin = async (pluginId: string, cleanupData: boolean = true) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/uninstall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cleanupData })
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Plugin uninstalled successfully' });
        setShowUninstallDialog(null);
        await loadPlugins();
      } else {
        const result = await response.json();
        setNotification({ type: 'error', message: result.error || 'Failed to uninstall plugin' });
      }
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to uninstall plugin' 
      });
    }
  };

  const handleUpdatePlugin = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Plugin updated successfully' });
        setShowUpdateDialog(null);
        await loadPlugins();
      } else {
        const result = await response.json();
        setNotification({ type: 'error', message: result.error || 'Failed to update plugin' });
      }
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to update plugin' 
      });
    }
  };

  const checkDependencyConflicts = (plugin: PluginInfo): { hasConflicts: boolean; conflicts: string[] } => {
    if (!plugin.dependencies) return { hasConflicts: false, conflicts: [] };

    const conflicts: string[] = [];
    const installedPluginIds = installedPlugins.map(p => p.id);

    plugin.dependencies.forEach(dep => {
      if (!installedPluginIds.includes(dep.id)) {
        conflicts.push(dep.id);
      }
    });

    return { hasConflicts: conflicts.length > 0, conflicts };
  };

  const getPluginStatus = (plugin: PluginInfo): 'installed' | 'available' | 'installing' => {
    if (installingPlugins.has(plugin.id)) return 'installing';
    if (installedPlugins.some(p => p.id === plugin.id)) return 'installed';
    return 'available';
  };

  const renderPluginCard = (plugin: PluginInfo) => {
    const status = getPluginStatus(plugin);
    const { hasConflicts } = checkDependencyConflicts(plugin);
    const isInstalled = status === 'installed';
    const isInstalling = status === 'installing';
    const installedPlugin = installedPlugins.find(p => p.id === plugin.id);

    return (
      <Card key={plugin.id} className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-lg font-semibold text-gray-900 truncate">
                   {plugin.name}
                 </h3>
                 <div className="flex items-center gap-1 text-xs text-gray-500">
                   <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                   <span>{plugin.rating}/5</span>
                 </div>
               </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>v{plugin.version}</span>
                <span>by {plugin.author}</span>
                {plugin.downloads && (
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {plugin.downloads.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
                         {isInstalled && installedPlugin && installedPlugin.version !== plugin.version && (
               <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                 <RefreshCw className="w-3 h-3" />
                 Update
               </div>
             )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {plugin.description}
          </p>

          {plugin.dependencies && plugin.dependencies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Dependencies</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDependencyDialog(plugin.id)}
                  className="h-6 px-2 text-xs"
                >
                  <Info className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {plugin.dependencies.slice(0, 3).map(dep => (
                  <span
                    key={dep.id}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      installedPlugins.some(p => p.id === dep.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {dep.id}
                  </span>
                ))}
                {plugin.dependencies.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{plugin.dependencies.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {hasConflicts && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <AlertTriangle className="w-3 h-3" />
              <span>Dependency conflicts detected</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {isInstalled ? (
              <div className="flex items-center gap-2">
                                 <Button
                   variant={installedPlugin?.status === 'enabled' ? "default" : "secondary"}
                   size="sm"
                   onClick={() => installedPlugin?.status === 'enabled'
                     ? handleDisablePlugin(plugin.id)
                     : handleEnablePlugin(plugin.id)
                   }
                   className="flex items-center gap-1"
                 >
                   {installedPlugin?.status === 'enabled' ? (
                     <>
                       <Eye className="w-3 h-3" />
                       Enabled
                     </>
                   ) : (
                     <>
                       <EyeOff className="w-3 h-3" />
                       Disabled
                     </>
                   )}
                 </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUninstallDialog(plugin.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                  Uninstall
                </Button>
                                 {installedPlugin && installedPlugin.version !== plugin.version && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowUpdateDialog(plugin.id)}
                     className="flex items-center gap-1"
                   >
                     <RefreshCw className="w-3 h-3" />
                     Update
                   </Button>
                 )}
              </div>
            ) : (
              <Button
                onClick={() => handleInstallPlugin(plugin)}
                disabled={isInstalling}
                className="flex items-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUninstallDialog = () => {
    if (!showUninstallDialog) return null;
    
    const plugin = [...installedPlugins, ...availablePlugins].find(p => p.id === showUninstallDialog);
    if (!plugin) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Uninstall Plugin</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to uninstall <strong>{plugin.name}</strong>?
            </p>
            <p className="text-xs text-gray-500">
              This will remove the plugin and all its data from your system.
            </p>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUninstallDialog(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUninstallPlugin(plugin.id)}
                className="flex-1"
              >
                Uninstall
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDependencyDialog = () => {
    if (!showDependencyDialog) return null;
    
    const plugin = [...installedPlugins, ...availablePlugins].find(p => p.id === showDependencyDialog);
    if (!plugin || !plugin.dependencies) return null;

    const { conflicts } = checkDependencyConflicts(plugin);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Dependencies for {plugin.name}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {plugin.dependencies.map(dep => {
                const isInstalled = installedPlugins.some(p => p.id === dep.id);
                const hasConflict = conflicts.includes(dep.id);
                
                return (
                  <div
                    key={dep.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isInstalled 
                        ? 'bg-green-50 border-green-200' 
                        : hasConflict 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{dep.id}</div>
                      <div className="text-sm text-gray-600">v{dep.version}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isInstalled ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : hasConflict ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-medium text-yellow-800 mb-2">Dependency Conflicts</h4>
                <p className="text-sm text-yellow-700">
                  The following dependencies need to be installed: {conflicts.join(', ')}
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDependencyDialog(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUpdateDialog = () => {
    if (!showUpdateDialog) return null;
    
    const plugin = installedPlugins.find(p => p.id === showUpdateDialog);
    const availablePlugin = availablePlugins.find(p => p.id === showUpdateDialog);
    if (!plugin || !availablePlugin || plugin.version === availablePlugin.version) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Update Plugin</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Update <strong>{plugin.name}</strong> to the latest version?
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Current version:</span>
                <span className="font-medium">{plugin.version}</span>
              </div>
                             <div className="flex items-center justify-between text-sm">
                 <span className="text-gray-500">Latest version:</span>
                 <span className="font-medium text-green-600">{availablePlugin.version}</span>
               </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdatePlugin(plugin.id)}
                className="flex-1"
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-600">Loading plugins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load plugins</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadPlugins}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plugin Manager</h1>
          <p className="text-gray-600">Browse and manage your plugins</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search plugins..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({installedPlugins.length + availablePlugins.length})
              </Button>
              <Button
                variant={filterType === 'installed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('installed')}
              >
                Installed ({installedPlugins.length})
              </Button>
              <Button
                variant={filterType === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('available')}
              >
                Available ({availablePlugins.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Plugin Grid */}
        {filteredPlugins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map(renderPluginCard)}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins available</h3>
            <p className="text-gray-600">Plugin marketplace coming soon</p>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm">{notification.message}</span>
              <button 
                onClick={() => setNotification(null)}
                className="ml-4 hover:opacity-75"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        {renderUninstallDialog()}
        {renderDependencyDialog()}
        {renderUpdateDialog()}
      </div>
    </div>
  );
};

export default PluginManagerPage; 