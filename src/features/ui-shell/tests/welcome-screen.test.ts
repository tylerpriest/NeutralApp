import { WelcomeScreen } from '../web/welcome-screen';
import { WelcomeScreenProps, WelcomeScreenConfig, WelcomeScreenAction } from '../../../shared/types';

// Mock DOM methods for testing
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  },
  writable: true
});

describe('WelcomeScreen', () => {
  let mockOnPluginInstallClick: jest.Mock;
  let mockOnLearnMoreClick: jest.Mock;
  let welcomeScreen: WelcomeScreen;

  beforeEach(() => {
    mockOnPluginInstallClick = jest.fn();
    mockOnLearnMoreClick = jest.fn();
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (welcomeScreen) {
      welcomeScreen.cleanup();
    }
  });

  describe('initialization', () => {
    it('should create WelcomeScreen with default configuration', () => {
      welcomeScreen = new WelcomeScreen();
      
      expect(welcomeScreen).toBeDefined();
      expect(welcomeScreen.getConfig()).toHaveProperty('title');
      expect(welcomeScreen.getConfig()).toHaveProperty('subtitle');
      expect(welcomeScreen.getConfig()).toHaveProperty('description');
      expect(welcomeScreen.getConfig()).toHaveProperty('actions');
    });

    it('should create WelcomeScreen with custom props', () => {
      const props: WelcomeScreenProps = {
        onPluginInstallClick: mockOnPluginInstallClick,
        onLearnMoreClick: mockOnLearnMoreClick,
        availablePluginCount: 42,
        systemFeatures: ['Authentication', 'Settings', 'Plugin Management']
      };

      welcomeScreen = new WelcomeScreen(props);
      
      expect(welcomeScreen.getProps()).toEqual(props);
    });

    it('should set default configuration values', () => {
      welcomeScreen = new WelcomeScreen();
      const config = welcomeScreen.getConfig();
      
      expect(config.title).toBe('Welcome to NeutralApp');
      expect(config.subtitle).toBe('Your Ultra-Modular Application Shell');
      expect(config.description).toContain('customizable platform');
      expect(config.actions).toHaveLength(2);
      expect(config.features).toBeDefined();
      expect(config.showPluginCount).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should render welcome screen content', () => {
      welcomeScreen = new WelcomeScreen({
        onPluginInstallClick: mockOnPluginInstallClick,
        onLearnMoreClick: mockOnLearnMoreClick
      });
      
      const content = welcomeScreen.render();
      
      expect(content).toContain('Welcome to NeutralApp');
      expect(content).toContain('Ultra-Modular Application Shell');
      expect(content).toContain('Install Plugins');
      expect(content).toContain('Learn More');
    });

    it('should render plugin count when available', () => {
      welcomeScreen = new WelcomeScreen({
        availablePluginCount: 15
      });
      
      const content = welcomeScreen.render();
      
      expect(content).toContain('15 plugins available');
    });

    it('should render system features list', () => {
      const features = ['Authentication', 'Settings Management', 'Plugin System'];
      welcomeScreen = new WelcomeScreen({
        systemFeatures: features
      });
      
      const content = welcomeScreen.render();
      
      features.forEach(feature => {
        expect(content).toContain(feature);
      });
    });

    it('should render without plugin count when not provided', () => {
      welcomeScreen = new WelcomeScreen({});
      
      const content = welcomeScreen.render();
      
      expect(content).not.toContain('plugins available');
    });
  });

  describe('actions', () => {
    it('should execute plugin install action when triggered', () => {
      welcomeScreen = new WelcomeScreen({
        onPluginInstallClick: mockOnPluginInstallClick
      });
      
      welcomeScreen.handleAction('install-plugins');
      
      expect(mockOnPluginInstallClick).toHaveBeenCalledTimes(1);
    });

    it('should execute learn more action when triggered', () => {
      welcomeScreen = new WelcomeScreen({
        onLearnMoreClick: mockOnLearnMoreClick
      });
      
      welcomeScreen.handleAction('learn-more');
      
      expect(mockOnLearnMoreClick).toHaveBeenCalledTimes(1);
    });

    it('should handle unknown action gracefully', () => {
      welcomeScreen = new WelcomeScreen();
      
      expect(() => {
        welcomeScreen.handleAction('unknown-action');
      }).not.toThrow();
    });

    it('should handle action when callback is not provided', () => {
      welcomeScreen = new WelcomeScreen({});
      
      expect(() => {
        welcomeScreen.handleAction('install-plugins');
      }).not.toThrow();
    });
  });

  describe('configuration updates', () => {
    it('should update configuration dynamically', () => {
      welcomeScreen = new WelcomeScreen();
      
      const newConfig: Partial<WelcomeScreenConfig> = {
        title: 'Custom Welcome',
        subtitle: 'Custom Subtitle',
        showPluginCount: false
      };
      
      welcomeScreen.updateConfig(newConfig);
      
      const config = welcomeScreen.getConfig();
      expect(config.title).toBe('Custom Welcome');
      expect(config.subtitle).toBe('Custom Subtitle');
      expect(config.showPluginCount).toBe(false);
    });

    it('should add custom actions', () => {
      welcomeScreen = new WelcomeScreen();
      
      const customAction: WelcomeScreenAction = {
        id: 'custom-action',
        label: 'Custom Action',
        action: jest.fn(),
        primary: false,
        icon: 'custom-icon'
      };
      
      welcomeScreen.addAction(customAction);
      
      const config = welcomeScreen.getConfig();
      expect(config.actions).toContainEqual(customAction);
    });

    it('should remove actions by id', () => {
      welcomeScreen = new WelcomeScreen();
      
      const initialActionCount = welcomeScreen.getConfig().actions.length;
      welcomeScreen.removeAction('install-plugins');
      
      const config = welcomeScreen.getConfig();
      expect(config.actions).toHaveLength(initialActionCount - 1);
      expect(config.actions.find(a => a.id === 'install-plugins')).toBeUndefined();
    });
  });

  describe('state management', () => {
    it('should track visibility state', () => {
      welcomeScreen = new WelcomeScreen();
      
      expect(welcomeScreen.isVisible()).toBe(false);
      
      welcomeScreen.show();
      expect(welcomeScreen.isVisible()).toBe(true);
      
      welcomeScreen.hide();
      expect(welcomeScreen.isVisible()).toBe(false);
    });

    it('should emit events when visibility changes', () => {
      const onShow = jest.fn();
      const onHide = jest.fn();
      
      welcomeScreen = new WelcomeScreen();
      welcomeScreen.onShow(onShow);
      welcomeScreen.onHide(onHide);
      
      welcomeScreen.show();
      expect(onShow).toHaveBeenCalledTimes(1);
      
      welcomeScreen.hide();
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('should cleanup event listeners', () => {
      const onShow = jest.fn();
      welcomeScreen = new WelcomeScreen();
      welcomeScreen.onShow(onShow);
      
      welcomeScreen.cleanup();
      welcomeScreen.show();
      
      expect(onShow).not.toHaveBeenCalled();
    });
  });

  describe('responsive behavior', () => {
    it('should provide mobile-friendly rendering', () => {
      welcomeScreen = new WelcomeScreen();
      
      const mobileContent = welcomeScreen.renderMobile();
      
      expect(mobileContent).toBeDefined();
      expect(mobileContent).toContain('Welcome to NeutralApp');
    });

    it('should adapt layout for small screens', () => {
      welcomeScreen = new WelcomeScreen();
      
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      const isMobile = welcomeScreen.isMobileView();
      expect(isMobile).toBe(true);
    });

    it('should detect desktop layout', () => {
      welcomeScreen = new WelcomeScreen();
      
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });
      
      const isMobile = welcomeScreen.isMobileView();
      expect(isMobile).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle rendering errors gracefully', () => {
      welcomeScreen = new WelcomeScreen({
        systemFeatures: null as any // Force error condition
      });
      
      expect(() => {
        welcomeScreen.render();
      }).not.toThrow();
    });

    it('should provide fallback content on error', () => {
      welcomeScreen = new WelcomeScreen();
      
      // Simulate error condition
      jest.spyOn(welcomeScreen, 'getConfig').mockImplementation(() => {
        throw new Error('Config error');
      });
      
      const content = welcomeScreen.renderSafe();
      
      expect(content).toContain('Welcome');
      expect(content).toBeDefined();
    });

    it('should log errors during action execution', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      welcomeScreen = new WelcomeScreen({
        onPluginInstallClick: () => {
          throw new Error('Action error');
        }
      });
      
      welcomeScreen.handleAction('install-plugins');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in plugin install callback'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
}); 