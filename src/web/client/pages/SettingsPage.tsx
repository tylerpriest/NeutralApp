import React, { useState, useEffect } from 'react';
import { SettingsService } from '../../../features/settings/services/settings.service';
import { PluginManager } from '../../../features/plugin-manager/services/plugin.manager';
import { Settings, SettingType, ValidationResult } from '../../../shared/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingSpinner } from '../../../shared/ui';
import { 
  Search, 
  Download, 
  RotateCcw, 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';

// Initialize services - these can be overridden for testing
let settingsService = new SettingsService();
let pluginManager = new PluginManager();

// Export for testing
export const setServices = (settings: SettingsService, plugins: PluginManager) => {
  settingsService = settings;
  pluginManager = plugins;
};

interface SettingGroup {
  id: string;
  name: string;
  description: string;
  settings: SettingItem[];
  icon?: React.ComponentType<any>;
}

interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: SettingType;
  value: any;
  options?: { value: any; label: string }[];
  validation?: ValidationResult;
  category: string;
}

const SettingsPage: React.FC = () => {
  const [settingGroups, setSettingGroups] = useState<SettingGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    filterSettings();
  }, [searchTerm]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load core settings
      const coreSettings = await loadCoreSettings();
      
      // Load plugin settings
      const pluginSettings = await loadPluginSettings();
      
      // Combine and organize settings
      const allGroups = [...coreSettings, ...pluginSettings];
      setSettingGroups(allGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCoreSettings = async (): Promise<SettingGroup[]> => {
    const coreSettings: SettingItem[] = [
      {
        key: 'theme',
        label: 'Theme',
        description: 'Choose your preferred color theme',
        type: SettingType.STRING,
        value: await settingsService.getSetting('theme') || 'light',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto (System)' }
        ],
        category: 'appearance'
      },
      {
        key: 'language',
        label: 'Language',
        description: 'Select your preferred language',
        type: SettingType.STRING,
        value: await settingsService.getSetting('language') || 'en',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'ja', label: 'Japanese' },
          { value: 'zh', label: 'Chinese' }
        ],
        category: 'localization'
      },
      {
        key: 'notifications',
        label: 'Notifications',
        description: 'Enable or disable system notifications',
        type: SettingType.BOOLEAN,
        value: await settingsService.getSetting('notifications') ?? true,
        category: 'notifications'
      },
      {
        key: 'autoSave',
        label: 'Auto Save',
        description: 'Automatically save changes',
        type: SettingType.BOOLEAN,
        value: await settingsService.getSetting('autoSave') ?? true,
        category: 'behavior'
      },
      {
        key: 'sessionTimeout',
        label: 'Session Timeout',
        description: 'Session timeout in minutes',
        type: SettingType.NUMBER,
        value: await settingsService.getSetting('sessionTimeout') || 30,
        category: 'security'
      }
    ];

    return [
      {
        id: 'general',
        name: 'General',
        description: 'Basic application settings',
        settings: coreSettings.filter(s => s.category === 'appearance' || s.category === 'behavior'),
        icon: SettingsIcon
      },
      {
        id: 'appearance',
        name: 'Appearance',
        description: 'Visual and display settings',
        settings: coreSettings.filter(s => s.category === 'appearance'),
        icon: Palette
      },
      {
        id: 'localization',
        name: 'Localization',
        description: 'Language and regional settings',
        settings: coreSettings.filter(s => s.category === 'localization'),
        icon: Globe
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Notification preferences',
        settings: coreSettings.filter(s => s.category === 'notifications'),
        icon: Bell
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security and privacy settings',
        settings: coreSettings.filter(s => s.category === 'security'),
        icon: Shield
      }
    ];
  };

  const loadPluginSettings = async (): Promise<SettingGroup[]> => {
    try {
      const installedPlugins = await pluginManager.getInstalledPlugins();
      const pluginGroups: SettingGroup[] = [];

      if (!installedPlugins || !Array.isArray(installedPlugins)) {
        return [];
      }

      for (const plugin of installedPlugins) {
        // Get the plugin settings
        const pluginSettings = await settingsService.getPluginSettings(plugin.id);
        
        // Create plugin group with existing settings
        const settings: SettingItem[] = Object.entries(pluginSettings || {}).map(([key, value]) => {
          return {
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            description: `Setting for ${plugin.name}`,
            type: typeof value === 'boolean' ? SettingType.BOOLEAN : 
                   typeof value === 'number' ? SettingType.NUMBER : 
                   Array.isArray(value) ? SettingType.ARRAY : SettingType.STRING,
            value,
            category: 'plugin'
          };
        });

        // Add plugin group if it has settings
        if (settings.length > 0) {
          pluginGroups.push({
            id: `plugin-${plugin.id}`,
            name: plugin.name,
            description: `Settings for ${plugin.name}`,
            settings,
            icon: SettingsIcon
          });
        }
      }

      return pluginGroups;
    } catch (error) {
      console.error('Error loading plugin settings:', error);
      return [];
    }
  };

  const filterSettings = () => {
    // This would filter settings based on search term
    // For now, we'll keep all settings visible
  };

  const handleSettingChange = async (setting: SettingItem, newValue: any) => {
    try {
      // Validate the new value
      const validation = await settingsService.validateSetting(setting.key, newValue);
      
      if (!validation || !validation.isValid) {
        setNotification({ 
          type: 'error', 
          message: `Invalid value: ${validation?.errors?.join(', ') || 'Validation failed'}` 
        });
        return;
      }

      // Save the setting
      if (setting.category === 'plugin') {
        const pluginId = selectedGroup.replace('plugin-', '');
        await settingsService.setPluginSetting(pluginId, setting.key, newValue);
      } else {
        await settingsService.setSetting(setting.key, newValue);
      }

      // Update local state
      setSettingGroups(prev => prev.map(group => ({
        ...group,
        settings: group.settings.map(s => 
          s.key === setting.key ? { ...s, value: newValue, validation } : s
        )
      })));

      setNotification({ type: 'success', message: 'Setting saved successfully' });
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to save setting' 
      });
    }
  };

  const handleResetSettings = async () => {
    try {
      await settingsService.resetToDefaults();
      setNotification({ type: 'success', message: 'Settings reset to defaults' });
      setShowResetDialog(false);
      await loadSettings(); // Reload settings
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to reset settings' 
      });
    }
  };

  const handleExportSettings = async () => {
    try {
      const allSettings: Record<string, any> = {};
      
      for (const group of settingGroups) {
        for (const setting of group.settings) {
          allSettings[setting.key] = setting.value;
        }
      }

      const dataStr = JSON.stringify(allSettings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'settings-export.json';
      link.click();
      
      setNotification({ type: 'success', message: 'Settings exported successfully' });
      setShowExportDialog(false);
    } catch (err) {
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to export settings' 
      });
    }
  };

  const renderSettingInput = (setting: SettingItem) => {
    const handleChange = (value: any) => {
      handleSettingChange(setting, value);
    };

    switch (setting.type) {
      case SettingType.BOOLEAN:
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={setting.value}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-light peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        );

      case SettingType.NUMBER:
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="w-full"
          />
        );

      case SettingType.STRING:
        if (setting.options) {
          return (
            <select
              className="flex h-10 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={setting.value}
              onChange={(e) => handleChange(e.target.value)}
              aria-label={setting.label}
            >
              {setting.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        return (
          <Input
            type="text"
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        );
    }
  };

  const renderSettingItem = (setting: SettingItem) => (
    <div key={setting.key} className="flex justify-between items-start p-6 border border-border rounded-lg bg-gray-very-light hover:border-primary/20 transition-colors">
      <div className="flex-1 mr-6">
        <label className="block text-sm font-semibold text-gray-dark mb-1">
          {setting.label}
        </label>
        <p className="text-sm text-gray-medium leading-relaxed">
          {setting.description}
        </p>
        {setting.validation && !setting.validation.isValid && (
          <div className="flex items-center gap-2 mt-2 text-sm text-error">
            <AlertCircle className="w-4 h-4" />
            {setting.validation.errors.join(', ')}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 min-w-[200px]">
        {renderSettingInput(setting)}
      </div>
    </div>
  );

  const renderResetDialog = () => {
    if (!showResetDialog) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-medium">
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetSettings}
              >
                Reset All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderExportDialog = () => {
    if (!showExportDialog) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-medium">
              Export all current settings to a JSON file for backup or migration.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportSettings}
              >
                Export Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-very-light flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-very-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-error mb-4">{error}</p>
          <Button onClick={loadSettings}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const currentGroup = settingGroups.find(g => g.id === selectedGroup);

  return (
    <div className="min-h-screen bg-gray-very-light">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-gray-medium">Configure your application preferences</p>
        </div>

        {/* Toolbar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-medium" />
                  <Input
                    type="text"
                    placeholder="Search settings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(true)}
                  className="flex items-center gap-2 text-error border-error hover:bg-error hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                {settingGroups.map(group => {
                  const IconComponent = group.icon || SettingsIcon;
                  return (
                    <button
                      key={group.id}
                      className={`flex items-center gap-3 p-4 text-left border-b border-border last:border-b-0 transition-colors hover:bg-gray-light ${
                        selectedGroup === group.id ? 'bg-primary text-white' : ''
                      }`}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <IconComponent className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-semibold">{group.name}</div>
                        <div className="text-sm opacity-80">{group.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <CardContent className="p-8">
              {currentGroup && (
                <div>
                  <div className="mb-8 pb-6 border-b border-border">
                    <h2 className="text-2xl font-semibold text-gray-dark mb-2">{currentGroup.name}</h2>
                    <p className="text-gray-medium">{currentGroup.description}</p>
                  </div>
                  <div className="space-y-6">
                    {currentGroup.settings.map(renderSettingItem)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-6 right-6 p-4 rounded-lg text-white font-medium z-50 flex items-center gap-3 max-w-md shadow-lg ${
            notification.type === 'success' ? 'bg-success' : 'bg-error'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dialogs */}
        {renderResetDialog()}
        {renderExportDialog()}
      </div>
    </div>
  );
};

export default SettingsPage; 