import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome to your NeutralApp dashboard</p>
        <div className="widget-container">
          <div className="widget-placeholder">
            <p>No plugins installed yet</p>
            <p>Install plugins to see widgets here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 