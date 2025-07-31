import React, { useState, useEffect } from 'react';
import { Package, BookOpen, Settings, Shield, Sparkles, ArrowRight, Plus, Book, Clock, TrendingUp } from 'lucide-react';
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

  const handleLearnMore = () => {
    // Open documentation in new tab
    window.open('https://github.com/your-org/neutral-app', '_blank');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleExploreReader = () => {
    navigate('/reader/library');
  };

  const readingPlugin = installedPlugins.find(plugin => plugin.id === 'reading-core');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col" data-testid="welcome-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">NeutralApp</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleAdmin}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Admin"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg" data-testid="welcome-illustration">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NeutralApp</span>
            </h1>

            <h2 className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {readingPlugin 
                ? "Your enhanced reading experience is ready!"
                : "Get started by installing your first plugin"
              }
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {readingPlugin 
                ? "The Reading Plugin Pack is installed and ready to use. Explore your library, track progress, and enjoy a comprehensive reading experience."
                : "Plugins add functionality to your dashboard. Browse our plugin marketplace to find the perfect tools for your workflow."
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {readingPlugin ? (
                <button 
                  data-testid="explore-reader"
                  onClick={handleExploreReader}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <BookOpen className="w-5 h-5" />
                  Explore Reader
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  data-testid="browse-plugins"
                  onClick={handleBrowsePlugins}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Package className="w-5 h-5" />
                  Browse Plugins
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              
              <button
                onClick={handleLearnMore}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <BookOpen className="w-5 h-5" />
                Learn More
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Modular Design</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Install only the features you need. Each plugin adds specific functionality to your workspace.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customizable</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Arrange widgets, customize layouts, and create the perfect environment for your productivity.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Built with security in mind. Plugins run in sandboxed environments for your safety.
              </p>
            </div>
          </div>

          {/* Reading Plugin Showcase */}
          {readingPlugin && (
            <div className="mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    📚 Reading Plugin Pack Installed
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Experience the most comprehensive reading system with advanced features, analytics, and seamless integration.
                  </p>
                </div>

                {/* Reading Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Library Management</h4>
                    <p className="text-xs text-gray-600">Organize and discover books</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Progress Tracking</h4>
                    <p className="text-xs text-gray-600">Monitor your reading journey</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Recently Read</h4>
                    <p className="text-xs text-gray-600">Continue where you left off</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Advanced Features</h4>
                    <p className="text-xs text-gray-600">AI assistance & analytics</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleExploreReader}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Explore Library
                  </button>
                  <button
                    onClick={handleBrowsePlugins}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Install More Plugins
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Plugin Area */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 transition-colors">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {readingPlugin ? 'More plugins available' : 'No plugins installed yet'}
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {readingPlugin 
                ? 'Discover more plugins to enhance your experience'
                : 'Install plugins to see widgets here'
              }
            </p>
            
            <button
              onClick={handleBrowsePlugins}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Package className="w-4 h-4" />
              Explore Plugins
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomeScreen; 