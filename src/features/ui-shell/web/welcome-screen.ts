import { 
  WelcomeScreenProps, 
  WelcomeScreenConfig, 
  WelcomeScreenAction 
} from '../../../shared';

export class WelcomeScreen {
  private props: WelcomeScreenProps;
  private config: WelcomeScreenConfig;
  private visible: boolean = false;
  private eventListeners: {
    onShow: (() => void)[];
    onHide: (() => void)[];
  } = {
    onShow: [],
    onHide: []
  };

  constructor(props: WelcomeScreenProps = {}) {
    this.props = props;
    this.config = this.createDefaultConfig();
    this.initializeComponent();
  }

  private createDefaultConfig(): WelcomeScreenConfig {
    return {
      title: 'Welcome to NeutralApp',
      subtitle: 'Your Ultra-Modular Application Shell',
      description: 'NeutralApp is a customizable platform that adapts to your needs through plugins. Get started by installing plugins to unlock powerful features tailored to your specific use case.',
      actions: [
        {
          id: 'install-plugins',
          label: 'Install Plugins',
          action: () => this.handlePluginInstallAction(),
          primary: true,
          icon: 'add'
        },
        {
          id: 'learn-more',
          label: 'Learn More',
          action: () => this.handleLearnMoreAction(),
          primary: false,
          icon: 'info'
        }
      ],
      features: [
        'Secure Authentication System',
        'Plugin Management & Marketplace',
        'Customizable Settings',
        'Responsive UI Framework',
        'Real-time Dashboard',
        'Administrative Tools'
      ],
      showPluginCount: true
    };
  }

  private initializeComponent(): void {
    console.log('WelcomeScreen component initialized');
  }

  // Public API methods

  getProps(): WelcomeScreenProps {
    return { ...this.props };
  }

  getConfig(): WelcomeScreenConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<WelcomeScreenConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }

  addAction(action: WelcomeScreenAction): void {
    this.config.actions.push(action);
  }

  removeAction(actionId: string): void {
    this.config.actions = this.config.actions.filter(action => action.id !== actionId);
  }

  handleAction(actionId: string): void {
    try {
      const action = this.config.actions.find(a => a.id === actionId);
      if (action && action.action) {
        action.action();
      }
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
    }
  }

  private handlePluginInstallAction(): void {
    if (this.props.onPluginInstallClick) {
      try {
        this.props.onPluginInstallClick();
      } catch (error) {
        console.error('Error in plugin install callback:', error);
      }
    }
  }

  private handleLearnMoreAction(): void {
    if (this.props.onLearnMoreClick) {
      try {
        this.props.onLearnMoreClick();
      } catch (error) {
        console.error('Error in learn more callback:', error);
      }
    }
  }

  // Visibility state management

  isVisible(): boolean {
    return this.visible;
  }

  show(): void {
    this.visible = true;
    this.eventListeners.onShow.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in onShow listener:', error);
      }
    });
  }

  hide(): void {
    this.visible = false;
    this.eventListeners.onHide.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in onHide listener:', error);
      }
    });
  }

  onShow(callback: () => void): void {
    this.eventListeners.onShow.push(callback);
  }

  onHide(callback: () => void): void {
    this.eventListeners.onHide.push(callback);
  }

  cleanup(): void {
    this.eventListeners.onShow = [];
    this.eventListeners.onHide = [];
    this.visible = false;
  }

  // Rendering methods

  render(): string {
    try {
      return this.renderContent();
    } catch (error) {
      console.error('Error rendering WelcomeScreen:', error);
      return this.renderSafe();
    }
  }

  renderSafe(): string {
    return `
      <div class="welcome-screen">
        <div class="welcome-content">
          <h1>Welcome to NeutralApp</h1>
          <p>Your application is loading...</p>
        </div>
      </div>
    `;
  }

  private renderContent(): string {
    const { title, subtitle, description, actions, features, showPluginCount } = this.config;
    
    let content = `
      <div class="welcome-screen">
        <div class="welcome-content">
          <header class="welcome-header">
            <h1 class="welcome-title">${title}</h1>
            <h2 class="welcome-subtitle">${subtitle}</h2>
          </header>
          
          <div class="welcome-description">
            <p>${description}</p>
          </div>
    `;

    // Add plugin count if available and enabled
    if (showPluginCount && this.props.availablePluginCount !== undefined) {
      content += `
        <div class="plugin-count">
          <p>${this.props.availablePluginCount} plugins available</p>
        </div>
      `;
    }

    // Add system features
    if (features && features.length > 0) {
      const featuresList = this.props.systemFeatures || features;
      content += `
        <div class="features-list">
          <h3>Core Features</h3>
          <ul>
            ${featuresList.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Add action buttons
    if (actions && actions.length > 0) {
      content += `
        <div class="welcome-actions">
          ${actions.map(action => `
            <button 
              class="welcome-action ${action.primary ? 'primary' : 'secondary'}"
              data-action="${action.id}"
            >
              ${action.icon ? `<span class="icon">${action.icon}</span>` : ''}
              ${action.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    content += `
        </div>
      </div>
    `;

    return content;
  }

  renderMobile(): string {
    const { title, subtitle, actions } = this.config;
    
    return `
      <div class="welcome-screen mobile">
        <div class="welcome-content mobile">
          <header class="welcome-header mobile">
            <h1 class="welcome-title mobile">${title}</h1>
            <h2 class="welcome-subtitle mobile">${subtitle}</h2>
          </header>
          
          <div class="welcome-actions mobile">
            ${actions.slice(0, 2).map(action => `
              <button 
                class="welcome-action mobile ${action.primary ? 'primary' : 'secondary'}"
                data-action="${action.id}"
              >
                ${action.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Responsive utilities

  isMobileView(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  }

  getResponsiveContent(): string {
    return this.isMobileView() ? this.renderMobile() : this.render();
  }
} 