import React, { useState, useEffect } from 'react';
import { SettingsService } from '../../../features/settings/services/settings.service';
import { PluginManager } from '../../../features/plugin-manager/services/plugin.manager';
import { Settings, SettingType, ValidationResult } from '../../../shared/types';
import './SettingsPage.css';

// Initialize services
const settingsService = new SettingsService();
const pluginManager = new PluginManager();

interface SettingGroup {
  id: string;
  name: string;
  description: string;
  settings: SettingItem[];
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
        settings: coreSettings.filter(s => s.category === 'appearance' || s.category === 'behavior')
      },
      {
        id: 'appearance',
        name: 'Appearance',
        description: 'Visual and display settings',
        settings: coreSettings.filter(s => s.category === 'appearance')
      },
      {
        id: 'localization',
        name: 'Localization',
        description: 'Language and regional settings',
        settings: coreSettings.filter(s => s.category === 'localization')
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Notification preferences',
        settings: coreSettings.filter(s => s.category === 'notifications')
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security and privacy settings',
        settings: coreSettings.filter(s => s.category === 'security')
      }
    ];
  };

  const loadPluginSettings = async (): Promise<SettingGroup[]> => {
    try {
      const installedPlugins = await pluginManager.getInstalledPlugins();
      const pluginGroups: SettingGroup[] = [];

      for (const plugin of installedPlugins) {
        const pluginSettings = await settingsService.getPluginSettings(plugin.id);
        
        if (Object.keys(pluginSettings).length > 0) {
          const settings: SettingItem[] = Object.entries(pluginSettings).map(([key, value]) => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            description: `Setting for ${plugin.name}`,
            type: typeof value === 'boolean' ? SettingType.BOOLEAN : 
                   typeof value === 'number' ? SettingType.NUMBER : SettingType.STRING,
            value,
            category: 'plugin'
          }));

          pluginGroups.push({
            id: `plugin-${plugin.id}`,
            name: plugin.name,
            description: `Settings for ${plugin.name}`,
            settings
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
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        );

      case SettingType.NUMBER:
        return (
          <input
            type="number"
            className="setting-input"
            value={setting.value}
            onChange={(e) => handleChange(Number(e.target.value))}
          />
        );

      case SettingType.STRING:
        if (setting.options) {
          return (
            <select
              className="setting-input"
              value={setting.value}
              onChange={(e) => handleChange(e.target.value)}
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
          <input
            type="text"
            className="setting-input"
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      default:
        return (
          <input
            type="text"
            className="setting-input"
            value={setting.value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };

  const renderSettingItem = (setting: SettingItem) => (
    <div key={setting.key} className="setting-item">
      <div className="setting-info">
        <label className="setting-label">{setting.label}</label>
        <p className="setting-description">{setting.description}</p>
        {setting.validation && !setting.validation.isValid && (
          <div className="setting-error">
            {setting.validation.errors.join(', ')}
          </div>
        )}
      </div>
      <div className="setting-control">
        {renderSettingInput(setting)}
      </div>
    </div>
  );

  const renderResetDialog = () => {
    if (!showResetDialog) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Reset Settings</h3>
          <p>Are you sure you want to reset all settings to their default values? This action cannot be undone.</p>
          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setShowResetDialog(false)}
            >
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={handleResetSettings}
            >
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderExportDialog = () => {
    if (!showExportDialog) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Export Settings</h3>
          <p>Export all current settings to a JSON file for backup or migration.</p>
          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={handleExportSettings}
            >
              Export Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

    if (isLoading) {
    return (
      <div className="settings-page" role="main">
        <div className="settings-content">
          <h1>Settings</h1>
          <div className="loading-state">
            <div className="loading-spinner" data-testid="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-page" role="main">
        <div className="settings-content">
          <h1>Settings</h1>
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadSettings} className="retry-button">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentGroup = settingGroups.find(g => g.id === selectedGroup);

  return (
    <div className="settings-page" role="main">
      <div className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Configure your application preferences</p>
        </div>

        <div className="settings-toolbar">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="settings-actions">
            <button
              className="export-button"
              onClick={() => setShowExportDialog(true)}
            >
              Export
            </button>
            <button
              className="reset-button"
              onClick={() => setShowResetDialog(true)}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            <nav className="settings-navigation" role="navigation">
              {settingGroups.map(group => (
                <button
                  key={group.id}
                  className={`nav-item ${selectedGroup === group.id ? 'active' : ''}`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="nav-item-content">
                    <span className="nav-item-name">{group.name}</span>
                    <span className="nav-item-description">{group.description}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-main">
            {currentGroup && (
              <div className="settings-group">
                <div className="group-header">
                  <h2>{currentGroup.name}</h2>
                  <p>{currentGroup.description}</p>
                </div>
                <div className="settings-form">
                  {currentGroup.settings.map(renderSettingItem)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button onClick={() => setNotification(null)}>×</button>
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