import React from 'react';

const PluginManagerPage: React.FC = () => {
  return (
    <div className="plugin-manager-page">
      <div className="plugin-manager-content">
        <h1>Plugin Manager</h1>
        <p>Browse and manage your plugins</p>
        <div className="plugin-grid">
          <div className="plugin-placeholder">
            <p>No plugins available</p>
            <p>Plugin marketplace coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginManagerPage; 