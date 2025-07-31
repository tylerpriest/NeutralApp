import React from 'react';
import { Package, BookOpen, Settings, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

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
          Get started by installing your first plugin
        </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Plugins add functionality to your dashboard. Browse our plugin marketplace to find the perfect tools for your workflow.
        </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button 
            data-testid="browse-plugins"
            onClick={handleBrowsePlugins}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
                <Package className="w-5 h-5" />
            Browse Plugins
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
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

        {/* Plugin Area */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 transition-colors">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
          </div>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            No plugins installed yet
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Install plugins to see widgets here
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