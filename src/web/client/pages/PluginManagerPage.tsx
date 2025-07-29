import React, { useState, useEffect } from 'react';
import { Package, Download, Settings, Trash2 } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  installed: boolean;
  enabled: boolean;
}

const PluginManagerPage: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockPlugins: Plugin[] = [
        {
          id: '1',
          name: 'Hello World Plugin',
          description: 'A simple demo plugin that displays a greeting message.',
          version: '1.0.0',
          author: 'NeutralApp Team',
          installed: true,
          enabled: true
        },
        {
          id: '2',
          name: 'Weather Widget',
          description: 'Display current weather information in your dashboard.',
          version: '2.1.0',
          author: 'Weather Corp',
          installed: false,
          enabled: false
        },
        {
          id: '3',
          name: 'Task Manager',
          description: 'Organize and track your tasks with a beautiful interface.',
          version: '1.5.2',
          author: 'Productivity Inc',
          installed: false,
          enabled: false
        }
      ];
      setPlugins(mockPlugins);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId ? { ...plugin, installed: true, enabled: true } : plugin
    ));
  };

  const handleUninstall = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId ? { ...plugin, installed: false, enabled: false } : plugin
    ));
  };

  const handleToggle = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === pluginId ? { ...plugin, enabled: !plugin.enabled } : plugin
    ));
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
        {/* Header */}
      <div style={{
        marginBottom: '32px'
      }}>
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

      {/* Search */}
      <div style={{
        marginBottom: '24px'
      }}>
        <input
                type="text"
                placeholder="Search plugins..."
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

      {/* Plugin Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredPlugins.map((plugin) => (
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
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280'
                }}>
                  <Package size={20} />
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Download size={14} />
                  Install
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

      {filteredPlugins.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px'
        }}>
          <div style={{
            fontSize: '48px',
            color: '#d1d5db',
            marginBottom: '16px'
          }}>
            📦
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            No plugins found
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0
          }}>
            Try adjusting your search terms
          </p>
          </div>
        )}
    </div>
  );
};

export default PluginManagerPage; 