import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../SettingsPage';
import { SettingsService } from '../../../../features/settings/services/settings.service';
import { PluginManager } from '../../../../features/plugin-manager/services/plugin.manager';
import { SettingType } from '../../../../shared/types';

// Mock the services
jest.mock('../../../../features/settings/services/settings.service');
jest.mock('../../../../features/plugin-manager/services/plugin.manager');

const mockSettingsService = SettingsService as jest.MockedClass<typeof SettingsService>;
const mockPluginManager = PluginManager as jest.MockedClass<typeof PluginManager>;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SettingsPage', () => {
  let mockSettingsInstance: any;
  let mockPluginInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock instances
    mockSettingsInstance = {
      getSetting: jest.fn(),
      setSetting: jest.fn(),
      validateSetting: jest.fn(),
      resetToDefaults: jest.fn(),
      getPluginSettings: jest.fn(),
      setPluginSetting: jest.fn(),
    };

    mockPluginInstance = {
      getInstalledPlugins: jest.fn(),
    };

    // Mock constructor returns
    mockSettingsService.mockImplementation(() => mockSettingsInstance);
    mockPluginManager.mockImplementation(() => mockPluginInstance);

    // Default mock implementations
    mockSettingsInstance.getSetting.mockResolvedValue('light');
    mockSettingsInstance.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
    mockSettingsInstance.getPluginSettings.mockResolvedValue({});
    mockPluginInstance.getInstalledPlugins.mockResolvedValue([]);
  });

  describe('Initial Rendering', () => {
    it('should render settings page with header', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Configure your application preferences')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      renderWithProviders(<SettingsPage />);
      
      expect(screen.getByText('Loading settings...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render settings groups after loading', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('Appearance')).toBeInTheDocument();
        expect(screen.getByText('Localization')).toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Security')).toBeInTheDocument();
      });
    });

    it('should render search input and action buttons', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search settings...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reset to Defaults' })).toBeInTheDocument();
      });
    });
  });

  describe('Settings Navigation', () => {
    it('should show general settings by default', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Choose your preferred color theme')).toBeInTheDocument();
      });
    });

    it('should switch between settings groups', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const localizationButton = screen.getByText('Localization');
        fireEvent.click(localizationButton);
        
        expect(screen.getByText('Language')).toBeInTheDocument();
        expect(screen.getByText('Select your preferred language')).toBeInTheDocument();
      });
    });

    it('should highlight active navigation item', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const generalButton = screen.getByText('General').closest('button');
        expect(generalButton).toHaveClass('active');
      });
    });
  });

  describe('Setting Inputs', () => {
    it('should render select dropdown for theme setting', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        expect(themeSelect).toBeInTheDocument();
        expect(themeSelect.tagName).toBe('SELECT');
      });
    });

    it('should render select dropdown for language setting', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const localizationButton = screen.getByText('Localization');
        fireEvent.click(localizationButton);
        
        const languageSelect = screen.getByDisplayValue('English');
        expect(languageSelect).toBeInTheDocument();
        expect(languageSelect.tagName).toBe('SELECT');
      });
    });

    it('should render toggle switch for boolean settings', async () => {
      // Mock boolean setting
      mockSettingsInstance.getSetting.mockResolvedValue(true);
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const toggleSwitch = screen.getByRole('checkbox');
        expect(toggleSwitch).toBeInTheDocument();
        expect(toggleSwitch).toBeChecked();
      });
    });

    it('should render number input for numeric settings', async () => {
      // Mock number setting
      mockSettingsInstance.getSetting.mockResolvedValue(10);
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const numberInput = screen.getByDisplayValue('10');
        expect(numberInput).toBeInTheDocument();
        expect(numberInput).toHaveAttribute('type', 'number');
      });
    });
  });

  describe('Setting Changes', () => {
    it('should save setting when changed', async () => {
      mockSettingsInstance.setSetting.mockResolvedValue(undefined);
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        
        expect(mockSettingsInstance.setSetting).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('should show success notification when setting is saved', async () => {
      mockSettingsInstance.setSetting.mockResolvedValue(undefined);
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        
        expect(screen.getByText('Setting saved successfully')).toBeInTheDocument();
      });
    });

    it('should validate setting before saving', async () => {
      mockSettingsInstance.validateSetting.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid theme value'] 
      });
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        fireEvent.change(themeSelect, { target: { value: 'invalid' } });
        
        expect(screen.getByText('Invalid value: Invalid theme value')).toBeInTheDocument();
        expect(mockSettingsInstance.setSetting).not.toHaveBeenCalled();
      });
    });

    it('should show error notification when setting save fails', async () => {
      mockSettingsInstance.setSetting.mockRejectedValue(new Error('Save failed'));
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Settings', () => {
    it('should load and display plugin settings', async () => {
      const mockPlugins = [
        { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' }
      ];
      
      mockPluginInstance.getInstalledPlugins.mockResolvedValue(mockPlugins);
      mockSettingsInstance.getPluginSettings.mockResolvedValue({
        'plugin-setting': 'test-value'
      });
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Plugin')).toBeInTheDocument();
        expect(screen.getByText('Settings for Test Plugin')).toBeInTheDocument();
      });
    });

    it('should save plugin settings correctly', async () => {
      const mockPlugins = [
        { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' }
      ];
      
      mockPluginInstance.getInstalledPlugins.mockResolvedValue(mockPlugins);
      mockSettingsInstance.getPluginSettings.mockResolvedValue({
        'plugin-setting': 'test-value'
      });
      mockSettingsInstance.setPluginSetting.mockResolvedValue(undefined);
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const pluginButton = screen.getByText('Test Plugin');
        fireEvent.click(pluginButton);
        
        const settingInput = screen.getByDisplayValue('test-value');
        fireEvent.change(settingInput, { target: { value: 'new-value' } });
        
        expect(mockSettingsInstance.setPluginSetting).toHaveBeenCalledWith(
          'test-plugin', 
          'plugin-setting', 
          'new-value'
        );
      });
    });
  });

  describe('Settings Actions', () => {
    it('should show reset confirmation dialog', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' });
        fireEvent.click(resetButton);
        
        expect(screen.getByText('Reset Settings')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to reset all settings to their default values? This action cannot be undone.')).toBeInTheDocument();
      });
    });

    it('should reset settings when confirmed', async () => {
      mockSettingsInstance.resetToDefaults.mockResolvedValue(undefined);
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' });
        fireEvent.click(resetButton);
        
        const confirmButton = screen.getByRole('button', { name: 'Reset All Settings' });
        fireEvent.click(confirmButton);
        
        expect(mockSettingsInstance.resetToDefaults).toHaveBeenCalled();
        expect(screen.getByText('Settings reset to defaults')).toBeInTheDocument();
      });
    });

    it('should show export dialog', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: 'Export' });
        fireEvent.click(exportButton);
        
        expect(screen.getByRole('heading', { name: 'Export Settings' })).toBeInTheDocument();
      });
    });

    it('should handle search functionality', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search settings...');
        fireEvent.change(searchInput, { target: { value: 'theme' } });
        
        // Should still show theme setting
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show validation errors for invalid settings', async () => {
      mockSettingsInstance.validateSetting.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid value'] 
      });
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        fireEvent.change(themeSelect, { target: { value: 'invalid' } });
        
        expect(screen.getByText('Invalid value: Validation failed')).toBeInTheDocument();
      });
    });

    it('should show error notification when setting save fails', async () => {
      mockSettingsInstance.setSetting.mockRejectedValue(new Error('Save failed'));
      
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const themeSelect = screen.getByDisplayValue('Light');
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(<SettingsPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search settings...');
        searchInput.focus();
        
        expect(searchInput).toHaveFocus();
      });
    });
  });
}); 