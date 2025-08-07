import React, { useState, useEffect } from 'react';
import { Package, BookOpen, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstalledPlugins();
  }, []);

  const loadInstalledPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plugins');
      if (response.ok) {
        const data = await response.json();
        setInstalledPlugins(data.installed || []);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowsePlugins = () => {
    navigate('/plugins');
  };

  const handleExploreReader = () => {
    navigate('/reader/library');
  };

  const readingPlugin = installedPlugins.find(plugin => plugin.id === 'reading-core');

  return (
    <div className="p-6 max-w-content mx-auto" data-testid="welcome-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-gray-500">
          Get started by installing your first plugin
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex gap-3">
          {readingPlugin ? (
            <button 
              data-testid="explore-reader"
              onClick={handleExploreReader}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Open Library
            </button>
          ) : (
            <button 
              data-testid="browse-plugins"
              onClick={handleBrowsePlugins}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Package className="w-4 h-4" />
              Browse Plugins
            </button>
          )}
          
          <button
            onClick={handleBrowsePlugins}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-dark border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-very-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Install Plugins
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Getting Started Section */}
        {!readingPlugin && (
          <div className="bg-white rounded-md border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-primary mb-3">
              Getting Started
            </h2>
            <p className="text-gray-medium mb-4 leading-relaxed">
              Plugins add functionality to your dashboard. Each plugin provides widgets and features 
              that help you be more productive.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-primary text-sm">Browse Available Plugins</h3>
                  <p className="text-gray-medium text-sm">Explore plugins in the Plugin Manager</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-primary text-sm">Install Plugins</h3>
                  <p className="text-gray-medium text-sm">Add the functionality you need</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-primary text-sm">Use Your Dashboard</h3>
                  <p className="text-gray-medium text-sm">Access your widgets and tools here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reading Plugin Status */}
        {readingPlugin && (
          <div className="bg-white rounded-md border border-gray-300 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-primary mb-2">
                  Reading Plugin Pack
                </h2>
                <p className="text-gray-medium mb-4 leading-relaxed">
                  Your reading environment is ready. Access your library, track reading progress, 
                  and enjoy a comprehensive reading experience.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleExploreReader}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Open Library
                  </button>
                  <button
                    onClick={handleBrowsePlugins}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-dark border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-very-light transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    More Plugins
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State for Widgets */}
        <div className="bg-white rounded-md border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="w-16 h-16 bg-gray-light rounded-md flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-medium" />
          </div>
          
          <h3 className="text-lg font-semibold text-primary mb-2">
            {readingPlugin ? 'Install more plugins' : 'No plugins installed yet'}
          </h3>
          
          <p className="text-gray-medium mb-4 max-w-md mx-auto">
            {readingPlugin 
              ? 'Add more functionality to your dashboard by installing additional plugins'
              : 'Install plugins to see widgets and functionality here'
            }
          </p>
          
          <button
            onClick={handleBrowsePlugins}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Package className="w-4 h-4" />
            Browse Plugins
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;