import React, { useState, useEffect } from 'react';
import { Package, Download, Settings, Trash2, BookOpen, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  installed: boolean;
  enabled: boolean;
  category?: string;
  tags?: string[];
}

interface PluginPack {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  plugins: Plugin[];
  installed: boolean;
  icon: string;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const PluginManagerPage: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [pluginPacks, setPluginPacks] = useState<PluginPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'installed' | 'packs'>('available');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [installing, setInstalling] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPlugins();
  }, []);

  // Toast notification system
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastNotification = { id, type, title, message };
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadPlugins = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const response = await fetch('/api/plugins');
        if (response.ok) {
          const data = await response.json();
          const availablePlugins = data.available || [];
          const installedPlugins = data.installed || [];
          
          // Create all plugins list with install status
          const allPluginData = [
            { id: 'demo-hello-world', name: 'Hello World Demo', description: 'A simple demo plugin to validate the plugin system', version: '1.0.0', author: 'NeutralApp Team', category: 'demo' },
            { id: 'weather-widget', name: 'Weather Widget', description: 'Display current weather information in your dashboard.', version: '2.1.0', author: 'Weather Corp', category: 'utility' },
            { id: 'task-manager', name: 'Task Manager', description: 'Organize and track your tasks with a beautiful interface.', version: '1.5.2', author: 'Productivity Inc', category: 'utility' },
            { id: 'reading-core', name: 'Reading Core', description: 'Book library management with metadata handling and search', version: '1.0.0', author: 'NeutralApp Team', category: 'reading', tags: ['reading', 'books', 'library'] },
            { id: 'reading-ui', name: 'Reading UI', description: 'Clean reader interface with typography controls', version: '1.0.0', author: 'NeutralApp Team', category: 'reading', tags: ['reading', 'ui', 'interface'] },
            { id: 'reading-persistence', name: 'Reading Persistence', description: 'Reading position and bookmark storage', version: '1.0.0', author: 'NeutralApp Team', category: 'reading', tags: ['reading', 'persistence', 'storage'] }
          ];

          const mergedPlugins: Plugin[] = allPluginData.map((plugin: any) => {
            const availablePlugin = availablePlugins.find((ap: any) => ap.id === plugin.id);
            const installed = installedPlugins.find((ip: any) => ip.id === plugin.id);
            return {
              id: plugin.id,
              name: plugin.name,
              description: plugin.description,
              version: plugin.version,
              author: plugin.author,
              category: plugin.category,
              tags: plugin.tags || [],
              installed: !!installed,
              enabled: installed?.status === 'enabled'
            };
          });
          
          setPlugins(mergedPlugins);
          
          // Create plugin packs
          const readingPack: PluginPack = {
            id: 'reading-pack',
            name: 'Kindle-esque Reading Pack',
            description: 'Complete reading experience with library management, clean UI, and progress tracking',
            version: '1.0.0',
            author: 'NeutralApp Team',
            icon: '📚',
            plugins: mergedPlugins.filter(p => p.category === 'reading'),
            installed: mergedPlugins.filter(p => p.category === 'reading').every(p => p.installed)
          };
          
          setPluginPacks([readingPack]);
          return;
        }
      } catch (error) {
        console.warn('Failed to load plugins from API, using mock data:', error);
      }
      
      // Fallback to mock data
      const mockPlugins: Plugin[] = [
        { id: 'demo-hello-world', name: 'Hello World Demo', description: 'A simple demo plugin to validate the plugin system', version: '1.0.0', author: 'NeutralApp Team', installed: false, enabled: false, category: 'demo' },
        { id: 'weather-widget', name: 'Weather Widget', description: 'Display current weather information in your dashboard.', version: '2.1.0', author: 'Weather Corp', installed: false, enabled: false, category: 'utility' },
        { id: 'task-manager', name: 'Task Manager', description: 'Organize and track your tasks with a beautiful interface.', version: '1.5.2', author: 'Productivity Inc', installed: false, enabled: false, category: 'utility' },
        { id: 'reading-core', name: 'Reading Core', description: 'Book library management with metadata handling and search', version: '1.0.0', author: 'NeutralApp Team', installed: false, enabled: false, category: 'reading', tags: ['reading', 'books', 'library'] },
        { id: 'reading-ui', name: 'Reading UI', description: 'Clean reader interface with typography controls', version: '1.0.0', author: 'NeutralApp Team', installed: false, enabled: false, category: 'reading', tags: ['reading', 'ui', 'interface'] },
        { id: 'reading-persistence', name: 'Reading Persistence', description: 'Reading position and bookmark storage', version: '1.0.0', author: 'NeutralApp Team', installed: false, enabled: false, category: 'reading', tags: ['reading', 'persistence', 'storage'] }
      ];
      
      // Load saved state from localStorage
      try {
        const savedPlugins = JSON.parse(localStorage.getItem('installed_plugins') || '[]');
        const updatedPlugins = mockPlugins.map(plugin => {
          const saved = savedPlugins.find((sp: any) => sp.id === plugin.id);
          return saved ? { ...plugin, ...saved } : plugin;
        });
        setPlugins(updatedPlugins);
        
        // Create plugin packs
        const readingPack: PluginPack = {
          id: 'reading-pack',
          name: 'Kindle-esque Reading Pack',
          description: 'Complete reading experience with library management, clean UI, and progress tracking',
          version: '1.0.0',
          author: 'NeutralApp Team',
          icon: '📚',
          plugins: updatedPlugins.filter(p => p.category === 'reading'),
          installed: updatedPlugins.filter(p => p.category === 'reading').every(p => p.installed)
        };
        
        setPluginPacks([readingPack]);
      } catch (error) {
        console.warn('Failed to load saved plugin state:', error);
        setPlugins(mockPlugins);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
      showToast('error', 'Loading Failed', 'Failed to load plugins. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (pluginId: string) => {
    if (installing.has(pluginId)) return;
    
    try {
      setInstalling(prev => new Set([...prev, pluginId]));
      const plugin = plugins.find(p => p.id === pluginId);
      
      showToast('info', 'Installing Plugin', `Installing ${plugin?.name || pluginId}...`);
      
      // Try to install via API
      try {
        const response = await fetch('/api/plugins/install', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pluginId }),
        });
        
        if (response.ok) {
          showToast('success', 'Plugin Installed', `${plugin?.name || pluginId} has been installed successfully!`);
          await loadPlugins();
          return;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Installation failed');
        }
      } catch (error) {
        console.warn('Failed to install plugin via API, using local state:', error);
        showToast('error', 'Installation Failed', `Failed to install ${plugin?.name || pluginId}: ${error}`);
      }
      
      // Fallback to local state update
      setPlugins(prev => {
        const updated = prev.map(plugin => 
          plugin.id === pluginId ? { ...plugin, installed: true, enabled: true } : plugin
        );
        
        // Save to localStorage
        localStorage.setItem('installed_plugins', JSON.stringify(
          updated.filter(p => p.installed)
        ));
        
        return updated;
      });
      
      showToast('success', 'Plugin Installed', `${plugin?.name || pluginId} has been installed locally!`);
    } catch (error) {
      console.error('Failed to install plugin:', error);
      showToast('error', 'Installation Failed', `Failed to install plugin: ${error}`);
    } finally {
      setInstalling(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
    }
  };

  const handleInstallPack = async (packId: string) => {
    const pack = pluginPacks.find(p => p.id === packId);
    if (!pack) return;
    
    showToast('info', 'Installing Plugin Pack', `Installing ${pack.name}...`);
    
    try {
      for (const plugin of pack.plugins) {
        if (!plugin.installed) {
          await handleInstall(plugin.id);
          // Add small delay between installs
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      showToast('success', 'Plugin Pack Installed', `${pack.name} has been installed successfully!`);
    } catch (error) {
      showToast('error', 'Pack Installation Failed', `Failed to install ${pack.name}: ${error}`);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      // Try to uninstall via API
      try {
        const response = await fetch(`/api/plugins/${pluginId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Refresh plugins after successful uninstallation
          await loadPlugins();
          return;
        }
      } catch (error) {
        console.warn('Failed to uninstall plugin via API, using local state:', error);
      }
      
      // Fallback to local state update
      setPlugins(prev => {
        const updated = prev.map(plugin => 
          plugin.id === pluginId ? { ...plugin, installed: false, enabled: false } : plugin
        );
        
        // Save to localStorage
        localStorage.setItem('installed_plugins', JSON.stringify(
          updated.filter(p => p.installed)
        ));
        
        return updated;
      });
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    }
  };

  const handleToggle = async (pluginId: string) => {
    try {
      const plugin = plugins.find(p => p.id === pluginId);
      if (!plugin) return;
      
      const newEnabled = !plugin.enabled;
      
      // Try to enable/disable via API
      try {
        const response = await fetch(`/api/plugins/${pluginId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: newEnabled }),
        });
        
        if (response.ok) {
          // Refresh plugins after successful toggle
          await loadPlugins();
          return;
        }
      } catch (error) {
        console.warn('Failed to toggle plugin via API, using local state:', error);
      }
      
      // Fallback to local state update
      setPlugins(prev => {
        const updated = prev.map(plugin => 
          plugin.id === pluginId ? { ...plugin, enabled: newEnabled } : plugin
        );
        
        // Save to localStorage
        localStorage.setItem('installed_plugins', JSON.stringify(
          updated.filter(p => p.installed)
        ));
        
        return updated;
      });
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          }}>Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Toast Notifications */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#3B82F6',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={() => removeToast(toast.id)}
          >
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Package size={16} />}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{toast.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          margin: '0 0 8px 0'
        }}>
          Plugin Manager
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0
        }}>
          Install and manage plugins to extend your dashboard functionality
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {(['available', 'installed', 'packs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === tab ? '#3B82F6' : '#6b7280',
              borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'packs' ? 'Plugin Packs' : `${tab} Plugins`}
            {tab === 'available' && (
              <span style={{
                marginLeft: '8px',
                background: '#f3f4f6',
                color: '#6b7280',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {plugins.filter(p => !p.installed).length}
              </span>
            )}
            {tab === 'installed' && (
              <span style={{
                marginLeft: '8px',
                background: '#dbeafe',
                color: '#3B82F6',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {plugins.filter(p => p.installed).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder={`Search ${activeTab === 'packs' ? 'plugin packs' : 'plugins'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            outline: 'none'
          }}
        />
      </div>

      {/* Plugin Packs Tab */}
      {activeTab === 'packs' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {pluginPacks.map((pack) => (
            <div
              key={pack.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {pack.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    margin: '0 0 4px 0'
                  }}>
                    {pack.name}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#9ca3af',
                    margin: 0
                  }}>
                    v{pack.version} • {pack.plugins.length} plugins
                  </p>
                </div>
                {pack.installed && (
                  <div style={{
                    background: '#d1fae5',
                    color: '#059669',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Installed
                  </div>
                )}
              </div>

              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: '0 0 16px 0'
              }}>
                {pack.description}
              </p>

              <div style={{
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Included Plugins:
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {pack.plugins.map((plugin) => (
                    <span
                      key={plugin.id}
                      style={{
                        fontSize: '11px',
                        background: plugin.installed ? '#dbeafe' : '#f3f4f6',
                        color: plugin.installed ? '#3B82F6' : '#6b7280',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {plugin.name}
                    </span>
                  ))}
                </div>
              </div>

              {!pack.installed ? (
                <button
                  onClick={() => handleInstallPack(pack.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  Install Plugin Pack
                </button>
              ) : (
                <div style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f9fafb',
                  color: '#059669',
                  border: '1px solid #d1fae5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  ✓ Plugin Pack Installed
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Available/Installed Plugins Grid */}
      {activeTab !== 'packs' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {filteredPlugins
            .filter(plugin => activeTab === 'available' ? !plugin.installed : plugin.installed)
            .map((plugin) => (
            <div
              key={plugin.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Plugin Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: plugin.category === 'reading' ? '#dbeafe' : '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: plugin.category === 'reading' ? '#3B82F6' : '#6b7280'
                  }}>
                    {plugin.category === 'reading' ? <BookOpen size={20} /> : <Package size={20} />}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      margin: '0 0 4px 0'
                    }}>
                      {plugin.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: 0
                    }}>
                      v{plugin.version} by {plugin.author}
                    </p>
                  </div>
                </div>
                {plugin.installed && (
                  <span style={{
                    fontSize: '12px',
                    color: '#059669',
                    backgroundColor: '#d1fae5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {plugin.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                )}
              </div>

              {/* Category Badge */}
              {plugin.category && (
                <div style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  background: plugin.category === 'reading' ? '#dbeafe' : '#f3f4f6',
                  color: plugin.category === 'reading' ? '#3B82F6' : '#6b7280',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  textTransform: 'capitalize'
                }}>
                  {plugin.category}
                </div>
              )}

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: '0 0 20px 0'
              }}>
                {plugin.description}
              </p>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {!plugin.installed ? (
                  <button
                    onClick={() => handleInstall(plugin.id)}
                    disabled={installing.has(plugin.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: installing.has(plugin.id) ? '#9ca3af' : '#1a1a1a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: installing.has(plugin.id) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Download size={14} />
                    {installing.has(plugin.id) ? 'Installing...' : 'Install'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggle(plugin.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: plugin.enabled ? '#f3f4f6' : '#1a1a1a',
                        color: plugin.enabled ? '#6b7280' : '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Settings size={14} />
                      {plugin.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleUninstall(plugin.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Trash2 size={14} />
                      Uninstall
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'available' && plugins.filter(p => !p.installed).length === 0) ||
        (activeTab === 'installed' && plugins.filter(p => p.installed).length === 0) ||
        (activeTab === 'packs' && pluginPacks.length === 0)) && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px'
        }}>
          <div style={{
            fontSize: '48px',
            color: '#d1d5db',
            marginBottom: '16px'
          }}>
            {activeTab === 'packs' ? '📦' : activeTab === 'installed' ? '✅' : '🔍'}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            No {activeTab === 'packs' ? 'plugin packs' : `${activeTab} plugins`} found
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0
          }}>
            {activeTab === 'available' 
              ? 'All plugins are already installed' 
              : activeTab === 'installed'
              ? 'Install some plugins from the Available tab'
              : 'No plugin packs available'}
          </p>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PluginManagerPage; 