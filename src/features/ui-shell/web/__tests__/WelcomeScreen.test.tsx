import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WelcomeScreen from '../WelcomeScreen';

// Mock the shared UI components
jest.mock('../../../../shared/ui', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h1 data-testid="card-title" className={className}>
      {children}
    </h1>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
  Package: () => <span data-testid="package-icon">Package</span>,
  Settings: () => <span data-testid="settings-icon">Settings</span>,
  Shield: () => <span data-testid="shield-icon">Shield</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
}));

describe('WelcomeScreen', () => {
  const mockOnPluginInstallClick = jest.fn();
  const mockOnLearnMoreClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render welcome screen with default content', () => {
      render(<WelcomeScreen />);
      
      expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
      expect(screen.getByText('Your Ultra-Modular Application Shell')).toBeInTheDocument();
      expect(screen.getByText(/NeutralApp is a customizable platform/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<WelcomeScreen />);
      
      expect(screen.getByText('Install Plugins')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should render plugin count when available', () => {
      render(<WelcomeScreen availablePluginCount={15} />);
      
      expect(screen.getByText('15 plugins available')).toBeInTheDocument();
      // Check that package icons exist (both in plugin count and features)
      const packageIcons = screen.getAllByTestId('package-icon');
      expect(packageIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should not render plugin count when not provided', () => {
      render(<WelcomeScreen />);
      
      expect(screen.queryByText(/plugins available/)).not.toBeInTheDocument();
    });

    it('should render system features list', () => {
      const features = ['Authentication', 'Settings Management', 'Plugin System'];
      render(<WelcomeScreen systemFeatures={features} />);
      
      features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should render default features when no system features provided', () => {
      render(<WelcomeScreen />);
      
      expect(screen.getByText('Secure Authentication System')).toBeInTheDocument();
      expect(screen.getByText('Plugin Management & Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Customizable Settings')).toBeInTheDocument();
    });

    it('should render feature icons', () => {
      render(<WelcomeScreen />);
      
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onPluginInstallClick when install plugins button is clicked', () => {
      render(<WelcomeScreen onPluginInstallClick={mockOnPluginInstallClick} />);
      
      const installButton = screen.getByText('Install Plugins');
      fireEvent.click(installButton);
      
      expect(mockOnPluginInstallClick).toHaveBeenCalledTimes(1);
    });

    it('should call onLearnMoreClick when learn more button is clicked', () => {
      render(<WelcomeScreen onLearnMoreClick={mockOnLearnMoreClick} />);
      
      const learnMoreButton = screen.getByText('Learn More');
      fireEvent.click(learnMoreButton);
      
      expect(mockOnLearnMoreClick).toHaveBeenCalledTimes(1);
    });

    it('should handle action clicks without callbacks gracefully', () => {
      render(<WelcomeScreen />);
      
      const installButton = screen.getByText('Install Plugins');
      const learnMoreButton = screen.getByText('Learn More');
      
      expect(() => {
        fireEvent.click(installButton);
        fireEvent.click(learnMoreButton);
      }).not.toThrow();
    });
  });

  describe('button variants and styling', () => {
    it('should render primary button for install plugins', () => {
      render(<WelcomeScreen />);
      
      const installButton = screen.getByText('Install Plugins').closest('button');
      expect(installButton).toHaveAttribute('data-variant', 'default');
    });

    it('should render outline button for learn more', () => {
      render(<WelcomeScreen />);
      
      const learnMoreButton = screen.getByText('Learn More').closest('button');
      expect(learnMoreButton).toHaveAttribute('data-variant', 'outline');
    });

    it('should render large size buttons', () => {
      render(<WelcomeScreen />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('data-size', 'lg');
      });
    });
  });

  describe('responsive design', () => {
    it('should have responsive grid layout for features', () => {
      render(<WelcomeScreen />);
      
      const featuresContainer = screen.getByText('Secure Authentication System').closest('div');
      expect(featuresContainer?.parentElement).toHaveClass('grid');
    });

    it('should have responsive button layout', () => {
      render(<WelcomeScreen />);
      
      const buttonsContainer = screen.getByText('Install Plugins').closest('div');
      expect(buttonsContainer).toHaveClass('flex');
      expect(buttonsContainer).toHaveClass('flex-col');
      expect(buttonsContainer).toHaveClass('sm:flex-row');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<WelcomeScreen />);
      
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      expect(screen.getByText('Your Ultra-Modular Application Shell')).toBeInTheDocument();
    });

    it('should have clickable buttons', () => {
      render(<WelcomeScreen />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('backward compatibility', () => {
    it('should expose methods on window object', () => {
      render(<WelcomeScreen 
        onPluginInstallClick={mockOnPluginInstallClick}
        availablePluginCount={10}
        systemFeatures={['Test Feature']}
      />);
      
      expect((window as any).welcomeScreen).toBeDefined();
      expect(typeof (window as any).welcomeScreen.getProps).toBe('function');
      expect(typeof (window as any).welcomeScreen.getConfig).toBe('function');
      expect(typeof (window as any).welcomeScreen.handleAction).toBe('function');
    });

    it('should provide correct props through getProps method', () => {
      render(<WelcomeScreen 
        onPluginInstallClick={mockOnPluginInstallClick}
        availablePluginCount={10}
        systemFeatures={['Test Feature']}
      />);
      
      const props = (window as any).welcomeScreen.getProps();
      expect(props.availablePluginCount).toBe(10);
      expect(props.systemFeatures).toEqual(['Test Feature']);
    });

    it('should handle action execution through exposed method', () => {
      render(<WelcomeScreen onPluginInstallClick={mockOnPluginInstallClick} />);
      
      (window as any).welcomeScreen.handleAction('install-plugins');
      
      expect(mockOnPluginInstallClick).toHaveBeenCalledTimes(1);
    });
  });
}); 