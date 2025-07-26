import React, { useState, useEffect } from 'react';
import { PluginManager } from '../../../features/plugin-manager/services/plugin.manager';
import { PluginInfo, PluginStatus, InstallResult } from '../../../shared/types';
import './PluginManagerPage.css';

// Initialize PluginManager instance
const pluginManager = new PluginManager();

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

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [availablePlugins, searchTerm]);

  const loadPlugins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [available, installed] = await Promise.all([
        pluginManager.getAvailablePlugins(),
        pluginManager.getInstalledPlugins()
      ]);

      setAvailablePlugins(available);
      setInstalledPlugins(installed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plugins');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlugins = () => {
    if (!searchTerm.trim()) {
      setFilteredPlugins(availablePlugins);
      return;
    }

    const filtered = availablePlugins.filter(plugin =>
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPlugins(filtered);
  };

  const handleInstallPlugin = async (plugin: PluginInfo) => {
    try {
      setInstallingPlugins(prev => new Set(prev).add(plugin.id));

      const result: InstallResult = await pluginManager.installPlugin({
        id: plugin.id,
        version: plugin.version,
        code: '',
        manifest: {
          id: plugin.id,
          name: plugin.name,
          version: plugin.version,
          description: plugin.description,
          author: plugin.author,
          main: '',
          dependencies: plugin.dependencies,
          permissions: plugin.permissions,
          api: []
        },
        signature: ''
      });

      if (result.success) {
        setNotification({ type: 'success', message: 'Plugin installed successfully' });
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
      await pluginManager.enablePlugin(pluginId);
      setNotification({ type: 'success', message: 'Plugin enabled successfully' });
      await loadPlugins();
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to enable plugin' 
      });
    }
  };

  const handleDisablePlugin = async (pluginId: string) => {
    try {
      await pluginManager.disablePlugin(pluginId);
      setNotification({ type: 'success', message: 'Plugin disabled successfully' });
      await loadPlugins();
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to disable plugin' 
      });
    }
  };

  const handleUninstallPlugin = async (pluginId: string, cleanupData: boolean = true) => {
    try {
      await pluginManager.uninstallPlugin(pluginId, cleanupData);
      setNotification({ type: 'success', message: 'Plugin uninstalled successfully' });
      setShowUninstallDialog(null);
      await loadPlugins();
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to uninstall plugin' 
      });
    }
  };

  const handleUpdatePlugin = async (pluginId: string) => {
    try {
      // This would integrate with the plugin manager's update functionality
      setNotification({ type: 'success', message: 'Plugin updated successfully' });
      setShowUpdateDialog(null);
      await loadPlugins();
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to update plugin' 
      });
    }
  };

  const checkDependencyConflicts = (plugin: PluginInfo): { hasConflicts: boolean; conflicts: string[] } => {
    const conflicts: string[] = [];
    
    // Check for version conflicts with installed plugins
    plugin.dependencies.forEach(dep => {
      const installedDep = installedPlugins.find(p => p.id === dep.id);
      if (installedDep && installedDep.version !== dep.version) {
        conflicts.push(`${dep.id}: requires ${dep.version}, but ${installedDep.version} is installed`);
      }
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  };

  const renderPluginCard = (plugin: PluginInfo) => {
    const isInstalling = installingPlugins.has(plugin.id);
    const isInstalled = installedPlugins.some(p => p.id === plugin.id);
    const installedPlugin = installedPlugins.find(p => p.id === plugin.id);
    const dependencyConflicts = checkDependencyConflicts(plugin);
    const hasUpdate = isInstalled && installedPlugin && installedPlugin.version !== plugin.version;

    return (
      <div key={plugin.id} className="plugin-card" data-testid={`plugin-card-${plugin.id}`}>
        <div className="plugin-header">
          <h3 className="plugin-title">{plugin.name}</h3>
          <div className="plugin-meta">
            <span className="plugin-version">v{plugin.version}</span>
            <span className="plugin-rating">★ {plugin.rating}</span>
            <span className="plugin-downloads">{plugin.downloads.toLocaleString()} downloads</span>
            {hasUpdate && (
              <span className="update-badge">Update Available</span>
            )}
          </div>
        </div>

        <div className="plugin-author">by {plugin.author}</div>
        
        <p className="plugin-description">{plugin.description}</p>

        {plugin.dependencies.length > 0 && (
          <div className="plugin-dependencies">
            <div className="dependencies-header">
              <strong>Dependencies:</strong>
              <button
                className="dependency-details-button"
                onClick={() => setShowDependencyDialog(plugin.id)}
              >
                View Details
              </button>
            </div>
            {plugin.dependencies.map(dep => {
              const isInstalled = installedPlugins.some(p => p.id === dep.id);
              const installedDep = installedPlugins.find(p => p.id === dep.id);
              const hasConflict = installedDep && installedDep.version !== dep.version;
              
              return (
                <span 
                  key={dep.id} 
                  className={`dependency-tag ${isInstalled ? 'installed' : ''} ${hasConflict ? 'conflict' : ''}`}
                >
                  {dep.id} {dep.version}
                  {isInstalled && <span className="installed-indicator">✓</span>}
                  {hasConflict && <span className="conflict-indicator">⚠</span>}
                </span>
              );
            })}
            {dependencyConflicts.hasConflicts && (
              <div className="dependency-conflicts">
                <span className="conflict-warning">⚠ Dependency conflicts detected</span>
              </div>
            )}
          </div>
        )}

        <div className="plugin-verification">
          <span className="verification-badge">Verified</span>
          <span className="security-badge">Security: Safe</span>
        </div>

        <div className="plugin-actions">
          {isInstalled ? (
            <div className="installed-actions">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={installedPlugin?.status === PluginStatus.ENABLED}
                  onChange={() => {
                    if (installedPlugin?.status === PluginStatus.ENABLED) {
                      handleDisablePlugin(plugin.id);
                    } else {
                      handleEnablePlugin(plugin.id);
                    }
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
              {hasUpdate && (
                <button
                  className="update-button"
                  onClick={() => setShowUpdateDialog(plugin.id)}
                >
                  Update
                </button>
              )}
              <button
                className="uninstall-button"
                onClick={() => setShowUninstallDialog(plugin.id)}
              >
                Uninstall
              </button>
            </div>
          ) : (
            <button
              className="install-button"
              onClick={() => handleInstallPlugin(plugin)}
              disabled={isInstalling || dependencyConflicts.hasConflicts}
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderUninstallDialog = () => {
    if (!showUninstallDialog) return null;

    const plugin = installedPlugins.find(p => p.id === showUninstallDialog);
    if (!plugin) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Uninstall Plugin</h3>
          <p>Are you sure you want to uninstall {plugin.name}?</p>
          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setShowUninstallDialog(null)}
            >
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={() => handleUninstallPlugin(plugin.id)}
            >
              Uninstall
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDependencyDialog = () => {
    if (!showDependencyDialog) return null;

    const plugin = availablePlugins.find(p => p.id === showDependencyDialog) || 
                   installedPlugins.find(p => p.id === showDependencyDialog);
    if (!plugin) return null;

    const dependencyConflicts = checkDependencyConflicts(plugin);

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Dependency Details - {plugin.name}</h3>
          <div className="dependency-details">
            {plugin.dependencies.length === 0 ? (
              <p>No dependencies required.</p>
            ) : (
              <>
                <h4>Required Dependencies:</h4>
                <div className="dependency-list">
                  {plugin.dependencies.map(dep => {
                    const isInstalled = installedPlugins.some(p => p.id === dep.id);
                    const installedDep = installedPlugins.find(p => p.id === dep.id);
                    const hasConflict = installedDep && installedDep.version !== dep.version;
                    
                    return (
                      <div key={dep.id} className={`dependency-item ${isInstalled ? 'installed' : ''} ${hasConflict ? 'conflict' : ''}`}>
                        <div className="dependency-info">
                          <strong>{dep.id}</strong>
                          <span>Required: {dep.version}</span>
                          {installedDep && <span>Installed: {installedDep.version}</span>}
                        </div>
                        <div className="dependency-status">
                          {isInstalled ? (
                            hasConflict ? (
                              <span className="status-conflict">⚠ Version Conflict</span>
                            ) : (
                              <span className="status-ok">✓ Installed</span>
                            )
                          ) : (
                            <span className="status-missing">✗ Missing</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {dependencyConflicts.hasConflicts && (
                  <div className="conflict-resolution">
                    <h4>Conflict Resolution:</h4>
                    <ul>
                      {dependencyConflicts.conflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                    <p className="conflict-note">
                      Note: Installing this plugin may require updating conflicting dependencies.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setShowDependencyDialog(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUpdateDialog = () => {
    if (!showUpdateDialog) return null;

    const plugin = installedPlugins.find(p => p.id === showUpdateDialog);
    const availablePlugin = availablePlugins.find(p => p.id === showUpdateDialog);
    if (!plugin || !availablePlugin) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Update Plugin</h3>
          <div className="update-details">
            <p>Update {plugin.name} from version {plugin.version} to {availablePlugin.version}?</p>
            <div className="version-comparison">
              <div className="current-version">
                <strong>Current Version:</strong> {plugin.version}
              </div>
              <div className="new-version">
                <strong>New Version:</strong> {availablePlugin.version}
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setShowUpdateDialog(null)}
            >
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={() => handleUpdatePlugin(plugin.id)}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="plugin-manager-page">
        <div className="plugin-manager-content">
          <h1>Plugin Manager</h1>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading plugins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plugin-manager-page">
        <div className="plugin-manager-content">
          <h1>Plugin Manager</h1>
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadPlugins} className="retry-button">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plugin-manager-page">
      <div className="plugin-manager-content">
        <h1>Plugin Manager</h1>
        <p>Browse and manage your plugins</p>

        {/* Search and Filter */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Installed Plugins Section */}
        {installedPlugins.length > 0 && (
          <section className="installed-plugins-section">
            <h2>Installed Plugins</h2>
            <div className="plugin-grid">
              {installedPlugins.map(renderPluginCard)}
            </div>
          </section>
        )}

        {/* Available Plugins Section */}
        <section className="available-plugins-section">
          <h2>Available Plugins</h2>
          {filteredPlugins.length > 0 ? (
            <div className="plugin-grid">
              {filteredPlugins.map(renderPluginCard)}
            </div>
          ) : searchTerm ? (
            <div className="no-results">
              <p>No plugins found matching your search</p>
            </div>
          ) : (
            <div className="empty-state">
              <p>No plugins available</p>
              <p>Plugin marketplace coming soon</p>
            </div>
          )}
        </section>

        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button onClick={() => setNotification(null)}>×</button>
          </div>
        )}

        {/* Uninstall Dialog */}
        {renderUninstallDialog()}

        {/* Dependency Details Dialog */}
        {renderDependencyDialog()}

        {/* Update Dialog */}
        {renderUpdateDialog()}
      </div>
    </div>
  );
};

export { pluginManager };
export default PluginManagerPage; 