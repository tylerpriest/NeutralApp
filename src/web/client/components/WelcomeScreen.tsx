import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/button';
import { Package, BookOpen } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleBrowsePlugins = () => {
    navigate('/plugins');
  };

  const handleLearnMore = () => {
    // In a real app, this would navigate to documentation
    window.open('/docs', '_blank');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50" data-testid="welcome-screen">
      <div className="max-w-2xl text-center bg-white p-12 rounded-lg shadow-lg">
        <div className="mb-8" data-testid="welcome-illustration">
          <div className="text-6xl mb-4">📦</div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
          Welcome to NeutralApp
        </h1>
        <h2 className="text-xl font-medium text-gray-700 mb-6 leading-relaxed">
          Get started by installing your first plugin
        </h2>
        
        <p className="text-base text-gray-600 mb-8 leading-relaxed">
          Plugins add functionality to your dashboard. Browse our plugin marketplace to find the perfect tools for your workflow.
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <Button 
            onClick={handleBrowsePlugins}
            className="min-w-[140px] px-6 py-3 text-base font-semibold"
          >
            <Package className="w-4 h-4 mr-2" />
            Browse Plugins
          </Button>
          
          <Button 
            onClick={handleLearnMore}
            variant="outline"
            className="min-w-[140px] px-6 py-3 text-base font-semibold"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </div>
        
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-8 mt-6">
          <p className="font-semibold text-gray-700 mb-1">No plugins installed yet</p>
          <p className="text-gray-600">Install plugins to see widgets here</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 