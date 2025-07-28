import React, { useState, useEffect } from 'react';
import { 
  WelcomeScreenProps, 
  WelcomeScreenConfig, 
  WelcomeScreenAction 
} from '../../../shared/types';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui';
import { 
  Plus, 
  Info, 
  CheckCircle, 
  Package, 
  Settings, 
  Shield, 
  Monitor, 
  Users 
} from 'lucide-react';

interface WelcomeScreenState {
  visible: boolean;
  config: WelcomeScreenConfig;
}

const defaultConfig: WelcomeScreenConfig = {
  title: 'Welcome to NeutralApp',
  subtitle: 'Your Ultra-Modular Application Shell',
  description: 'NeutralApp is a customizable platform that adapts to your needs through plugins. Get started by installing plugins to unlock powerful features tailored to your specific use case.',
  actions: [
    {
      id: 'install-plugins',
      label: 'Install Plugins',
      action: () => {},
      primary: true,
      icon: 'add'
    },
    {
      id: 'learn-more',
      label: 'Learn More',
      action: () => {},
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

const featureIcons = {
  'Secure Authentication System': Shield,
  'Plugin Management & Marketplace': Package,
  'Customizable Settings': Settings,
  'Responsive UI Framework': Monitor,
  'Real-time Dashboard': CheckCircle,
  'Administrative Tools': Users
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPluginInstallClick,
  onLearnMoreClick,
  availablePluginCount,
  systemFeatures
}) => {
  const [state, setState] = useState<WelcomeScreenState>({
    visible: true,
    config: { ...defaultConfig }
  });

  const [eventListeners] = useState({
    onShow: [] as (() => void)[],
    onHide: [] as (() => void)[]
  });

  // Initialize with custom props
  useEffect(() => {
    if (systemFeatures) {
      setState(prev => ({
        ...prev,
        config: {
          ...prev.config,
          features: systemFeatures
        }
      }));
    }
  }, [systemFeatures]);

  const handleAction = (actionId: string) => {
    try {
      const action = state.config.actions.find(a => a.id === actionId);
      if (action && action.action) {
        action.action();
      }

      // Handle specific actions
      if (actionId === 'install-plugins' && onPluginInstallClick) {
        onPluginInstallClick();
      } else if (actionId === 'learn-more' && onLearnMoreClick) {
        onLearnMoreClick();
      }
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
    }
  };

  const show = () => {
    setState(prev => ({ ...prev, visible: true }));
    eventListeners.onShow.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in onShow listener:', error);
      }
    });
  };

  const hide = () => {
    setState(prev => ({ ...prev, visible: false }));
    eventListeners.onHide.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in onHide listener:', error);
      }
    });
  };

  const updateConfig = (newConfig: Partial<WelcomeScreenConfig>) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...newConfig
      }
    }));
  };

  const addAction = (action: WelcomeScreenAction) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        actions: [...prev.config.actions, action]
      }
    }));
  };

  const removeAction = (actionId: string) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        actions: prev.config.actions.filter(action => action.id !== actionId)
      }
    }));
  };

  const isMobileView = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  };

  // Expose methods for backward compatibility
  React.useEffect(() => {
    // Attach methods to window for backward compatibility
    (window as any).welcomeScreen = {
      getProps: () => ({ onPluginInstallClick, onLearnMoreClick, availablePluginCount, systemFeatures }),
      getConfig: () => state.config,
      updateConfig,
      addAction,
      removeAction,
      handleAction,
      isVisible: () => state.visible,
      show,
      hide,
      onShow: (callback: () => void) => eventListeners.onShow.push(callback),
      onHide: (callback: () => void) => eventListeners.onHide.push(callback),
      cleanup: () => {
        eventListeners.onShow.length = 0;
        eventListeners.onHide.length = 0;
        setState(prev => ({ ...prev, visible: false }));
      },
      isMobileView,
      render: () => '', // Not used in React version
      renderMobile: () => '', // Not used in React version
      renderSafe: () => '', // Not used in React version
      getResponsiveContent: () => '' // Not used in React version
    };
  }, [state.config, state.visible, onPluginInstallClick, onLearnMoreClick, availablePluginCount, systemFeatures]);

  if (!state.visible) {
    return null;
  }

  const { title, subtitle, description, actions, features, showPluginCount } = state.config;
  const featuresList = systemFeatures || features || [];

  return (
    <div className="min-h-screen bg-gray-very-light flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            {title}
          </CardTitle>
          <p className="text-xl text-gray-medium font-medium">
            {subtitle}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Description */}
          <div className="text-center">
            <p className="text-gray-dark text-lg leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Plugin Count */}
          {showPluginCount && availablePluginCount !== undefined && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full">
                <Package className="w-4 h-4" />
                <span className="font-medium">
                  {availablePluginCount} plugins available
                </span>
              </div>
            </div>
          )}

          {/* Features List */}
          {featuresList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuresList.map((feature, index) => {
                const IconComponent = featureIcons[feature as keyof typeof featureIcons] || CheckCircle;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-dark">
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          {actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.primary ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleAction(action.id)}
                  className="min-w-[160px]"
                >
                  {action.icon === 'add' && <Plus className="w-4 h-4 mr-2" />}
                  {action.icon === 'info' && <Info className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen; 