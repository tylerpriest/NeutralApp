import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

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
    <div className="welcome-screen" data-testid="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-illustration" data-testid="welcome-illustration">
          <div className="illustration-icon">📦</div>
        </div>
        
        <h1 className="welcome-title">Welcome to NeutralApp</h1>
        <h2 className="welcome-subtitle">Get started by installing your first plugin</h2>
        
        <p className="welcome-description">
          Plugins add functionality to your dashboard. Browse our plugin marketplace to find the perfect tools for your workflow.
        </p>
        
        <div className="welcome-actions">
          <button 
            className="welcome-cta-button" 
            onClick={handleBrowsePlugins}
            type="button"
          >
            Browse Plugins
          </button>
          
          <button 
            className="welcome-secondary-button" 
            onClick={handleLearnMore}
            type="button"
          >
            Learn More
          </button>
        </div>
        
        <div className="widget-placeholder">
          <p>No plugins installed yet</p>
          <p>Install plugins to see widgets here</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 