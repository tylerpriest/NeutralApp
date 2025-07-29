import React from 'react';
import { Package, BookOpen } from 'lucide-react';
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '48px 24px',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#f3f4f6',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          color: '#6b7280'
        }}>
          <Package size={32} />
        </div>

        {/* Main Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          Welcome to NeutralApp
        </h1>

        {/* Subtitle */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#6b7280',
          margin: '0 0 16px 0',
          lineHeight: '1.3'
        }}>
          Get started by installing your first plugin
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.6',
          margin: '0 0 32px 0',
          maxWidth: '480px'
        }}>
          Plugins add functionality to your dashboard. Browse our plugin marketplace to find the perfect tools for your workflow.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '48px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }} onClick={handleBrowsePlugins}>
            <Package size={18} />
            Browse Plugins
          </button>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={handleLearnMore}>
            <BookOpen size={18} />
            Learn More
          </button>
        </div>

        {/* Plugin Area */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          minHeight: '300px',
          border: '2px dashed #e5e7eb',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '48px 24px'
        }}>
          <div style={{
            fontSize: '48px',
            color: '#d1d5db',
            marginBottom: '16px'
          }}>
            📦
          </div>
          <p style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            No plugins installed yet
          </p>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0
          }}>
            Install plugins to see widgets here
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 