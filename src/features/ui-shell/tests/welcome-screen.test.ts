import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WelcomeScreen } from '../web/WelcomeScreen';
import { WelcomeScreenProps } from '../../../shared/types';

describe('WelcomeScreen', () => {
  let mockOnPluginInstallClick: jest.Mock;
  let mockOnLearnMoreClick: jest.Mock;

  beforeEach(() => {
    mockOnPluginInstallClick = jest.fn();
    mockOnLearnMoreClick = jest.fn();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render welcome screen with default configuration', () => {
      render(React.createElement(WelcomeScreen));
      
      expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
      expect(screen.getByText('Your Ultra-Modular Application Shell')).toBeInTheDocument();
      expect(screen.getByText(/NeutralApp is a customizable platform/)).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      const props: WelcomeScreenProps = {
        onPluginInstallClick: mockOnPluginInstallClick,
        onLearnMoreClick: mockOnLearnMoreClick,
        availablePluginCount: 42,
        systemFeatures: ['Authentication', 'Settings', 'Plugin Management']
      };

      render(React.createElement(WelcomeScreen, props));
      
      expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
    });

    it('should display default features', () => {
      render(React.createElement(WelcomeScreen));
      
      expect(screen.getByText('Secure Authentication System')).toBeInTheDocument();
      expect(screen.getByText('Plugin Management & Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Customizable Settings')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(React.createElement(WelcomeScreen));
      
      expect(screen.getByText('Install Plugins')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onPluginInstallClick when install plugins button is clicked', () => {
      render(React.createElement(WelcomeScreen, { onPluginInstallClick: mockOnPluginInstallClick }));
      
      const installButton = screen.getByText('Install Plugins');
      fireEvent.click(installButton);
      
      expect(mockOnPluginInstallClick).toHaveBeenCalledTimes(1);
    });

    it('should call onLearnMoreClick when learn more button is clicked', () => {
      render(React.createElement(WelcomeScreen, { onLearnMoreClick: mockOnLearnMoreClick }));
      
      const learnMoreButton = screen.getByText('Learn More');
      fireEvent.click(learnMoreButton);
      
      expect(mockOnLearnMoreClick).toHaveBeenCalledTimes(1);
    });

    it('should display plugin count when available', () => {
      render(React.createElement(WelcomeScreen, { availablePluginCount: 15 }));
      
      expect(screen.getByText(/15 plugins available/)).toBeInTheDocument();
    });

    it('should display custom system features', () => {
      const features = ['Custom Auth', 'Advanced Settings', 'Plugin System'];
      render(React.createElement(WelcomeScreen, { systemFeatures: features }));
      
      expect(screen.getByText('Custom Auth')).toBeInTheDocument();
      expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
      expect(screen.getByText('Plugin System')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(React.createElement(WelcomeScreen));
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome to NeutralApp');
    });

    it('should have accessible buttons', () => {
      render(React.createElement(WelcomeScreen));
      
      const installButton = screen.getByRole('button', { name: /install plugins/i });
      const learnMoreButton = screen.getByRole('button', { name: /learn more/i });
      
      expect(installButton).toBeInTheDocument();
      expect(learnMoreButton).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should have responsive classes', () => {
      render(React.createElement(WelcomeScreen));
      
      const container = screen.getByText('Welcome to NeutralApp').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen');
    });

    it('should have proper card layout', () => {
      render(React.createElement(WelcomeScreen));
      
      const card = screen.getByText('Welcome to NeutralApp').closest('.w-full');
      expect(card).toHaveClass('w-full');
    });
  });

  describe('configuration', () => {
    it('should handle missing callbacks gracefully', () => {
      render(React.createElement(WelcomeScreen));
      
      const installButton = screen.getByText('Install Plugins');
      const learnMoreButton = screen.getByText('Learn More');
      
      expect(() => {
        fireEvent.click(installButton);
        fireEvent.click(learnMoreButton);
      }).not.toThrow();
    });
  });
}); 