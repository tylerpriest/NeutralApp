import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PluginCard from '../PluginCard';
import { Package } from 'lucide-react';

const mockProps = {
  id: 'test-plugin',
  name: 'Test Plugin',
  description: 'A test plugin for demonstration',
  version: '1.0.0',
  author: 'Test Author',
  status: 'enabled' as const,
  category: 'utility',
  tags: ['test', 'demo', 'utility'],
  icon: <Package data-testid="plugin-icon" />
};

describe('PluginCard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render plugin information correctly', () => {
      render(<PluginCard {...mockProps} />);

      expect(screen.getByText('Test Plugin')).toBeInTheDocument();
      expect(screen.getByText('A test plugin for demonstration')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('by Test Author')).toBeInTheDocument();
      expect(screen.getByText('utility')).toBeInTheDocument();
      expect(screen.getByTestId('plugin-icon')).toBeInTheDocument();
    });

    it('should render tags correctly', () => {
      render(<PluginCard {...mockProps} />);

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('demo')).toBeInTheDocument();
    });

    it('should show +N more for excess tags', () => {
      const propsWithManyTags = {
        ...mockProps,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      };

      render(<PluginCard {...propsWithManyTags} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('+3 more')).toBeInTheDocument();
    });

    it('should render fallback icon when no icon provided', () => {
      const { icon, ...propsWithoutIcon } = mockProps;

      render(<PluginCard {...propsWithoutIcon} />);

      // Should show first letter of plugin name
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should show enabled status with correct icon', () => {
      render(<PluginCard {...mockProps} status="enabled" />);

      // Check for SVG with success class
      const statusIcon = document.querySelector('.text-success');
      expect(statusIcon).toBeInTheDocument();
    });

    it('should show disabled status with correct icon', () => {
      render(<PluginCard {...mockProps} status="disabled" />);

      // Check for SVG with gray-medium class
      const statusIcon = document.querySelector('.text-gray-medium');
      expect(statusIcon).toBeInTheDocument();
    });

    it('should show loading status with spinner', () => {
      render(<PluginCard {...mockProps} status="loading" />);

      // Check for spinner animation
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show error status with error icon', () => {
      render(<PluginCard {...mockProps} status="error" />);

      // Check for SVG with error class
      const errorIcon = document.querySelector('.text-error');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show disable button for enabled plugin', () => {
      const onDisable = jest.fn();
      render(<PluginCard {...mockProps} status="enabled" onDisable={onDisable} />);

      expect(screen.getByText('Disable')).toBeInTheDocument();
    });

    it('should show enable button for disabled plugin', () => {
      const onEnable = jest.fn();
      render(<PluginCard {...mockProps} status="disabled" onEnable={onEnable} />);

      expect(screen.getByText('Enable')).toBeInTheDocument();
    });

    it('should call onEnable when enable button is clicked', async () => {
      const onEnable = jest.fn();
      render(<PluginCard {...mockProps} status="disabled" onEnable={onEnable} />);

      await user.click(screen.getByText('Enable'));
      expect(onEnable).toHaveBeenCalledTimes(1);
    });

    it('should call onDisable when disable button is clicked', async () => {
      const onDisable = jest.fn();
      render(<PluginCard {...mockProps} status="enabled" onDisable={onDisable} />);

      await user.click(screen.getByText('Disable'));
      expect(onDisable).toHaveBeenCalledTimes(1);
    });

    it('should show configure button for enabled plugin', () => {
      const onConfigure = jest.fn();
      render(<PluginCard {...mockProps} status="enabled" onConfigure={onConfigure} />);

      // Look for settings icon in configure button
      const configureButton = document.querySelector('.lucide-settings')?.closest('button');
      expect(configureButton).toBeInTheDocument();
    });

    it('should not show configure button for disabled plugin', () => {
      const onConfigure = jest.fn();
      render(<PluginCard {...mockProps} status="disabled" onConfigure={onConfigure} />);

      // Settings icon should not be present
      const configureButton = document.querySelector('.lucide-settings');
      expect(configureButton).not.toBeInTheDocument();
    });

    it('should call onConfigure when configure button is clicked', async () => {
      const onConfigure = jest.fn();
      render(<PluginCard {...mockProps} status="enabled" onConfigure={onConfigure} />);

      const configureButton = document.querySelector('.lucide-settings')?.closest('button');
      if (configureButton) {
        await user.click(configureButton);
        expect(onConfigure).toHaveBeenCalledTimes(1);
      }
    });

    it('should not show actions when showActions is false', () => {
      render(<PluginCard {...mockProps} showActions={false} />);

      expect(screen.queryByText('Disable')).not.toBeInTheDocument();
      expect(screen.queryByText('Enable')).not.toBeInTheDocument();
    });
  });

  describe('Widget Mode', () => {
    it('should be clickable when isWidget is true', async () => {
      const onOpen = jest.fn();
      const { container } = render(<PluginCard {...mockProps} isWidget onOpen={onOpen} />);

      // Card should be clickable
      const card = container.firstChild as HTMLElement;
      await user.click(card);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should show external link button for widgets', () => {
      const onOpen = jest.fn();
      render(<PluginCard {...mockProps} isWidget onOpen={onOpen} />);

      // Look for external link icon
      const externalLinkButton = document.querySelector('.lucide-external-link')?.closest('button');
      expect(externalLinkButton).toBeInTheDocument();
    });

    it('should call onOpen when external link button is clicked', async () => {
      const onOpen = jest.fn();
      render(<PluginCard {...mockProps} isWidget onOpen={onOpen} />);

      const externalLinkButton = document.querySelector('.lucide-external-link')?.closest('button');
      if (externalLinkButton) {
        await user.click(externalLinkButton);
        expect(onOpen).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Loading States', () => {
    it('should show loading overlay when status is loading', () => {
      render(<PluginCard {...mockProps} status="loading" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should disable buttons when action is in progress', async () => {
      const onEnable = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<PluginCard {...mockProps} status="disabled" onEnable={onEnable} />);

      const enableButton = screen.getByText('Enable').closest('button');
      if (enableButton) {
        await user.click(enableButton);

        // Button should be disabled while loading
        expect(enableButton).toBeDisabled();
      }
    });
  });

  describe('Sizes', () => {
    it('should apply correct height class for small size', () => {
      const { container } = render(<PluginCard {...mockProps} size="small" />);
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('h-32');
    });

    it('should apply correct height class for medium size', () => {
      const { container } = render(<PluginCard {...mockProps} size="medium" />);
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('h-40');
    });

    it('should apply correct height class for large size', () => {
      const { container } = render(<PluginCard {...mockProps} size="large" />);
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('h-48');
    });
  });

  describe('Event Handling', () => {
    it('should stop propagation on action button clicks', async () => {
      const onOpen = jest.fn();
      const onDisable = jest.fn();
      
      render(
        <PluginCard 
          {...mockProps} 
          status="enabled" 
          isWidget 
          onOpen={onOpen} 
          onDisable={onDisable} 
        />
      );

      const disableButton = screen.getByText('Disable');
      await user.click(disableButton);

      // Only onDisable should be called, not onOpen
      expect(onDisable).toHaveBeenCalledTimes(1);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('should handle missing optional props gracefully', () => {
      const minimalProps = {
        id: 'minimal-plugin',
        name: 'Minimal Plugin',
        description: 'Basic plugin',
        status: 'enabled' as const
      };

      expect(() => render(<PluginCard {...minimalProps} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for buttons', () => {
      const onEnable = jest.fn();
      const onConfigure = jest.fn();
      
      render(
        <PluginCard 
          {...mockProps} 
          status="disabled" 
          onEnable={onEnable} 
          onConfigure={onConfigure} 
        />
      );

      expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const onEnable = jest.fn();
      render(<PluginCard {...mockProps} status="disabled" onEnable={onEnable} />);

      const enableButton = screen.getByText('Enable').closest('button');
      if (enableButton) {
        enableButton.focus();
        
        await user.keyboard('{Enter}');
        expect(onEnable).toHaveBeenCalledTimes(1);
      }
    });
  });
});