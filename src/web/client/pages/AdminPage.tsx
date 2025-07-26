import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-content">
        <h1>Admin Dashboard</h1>
        <p>System monitoring and administration</p>
        <div className="admin-grid">
          <div className="admin-card">
            <h3>System Health</h3>
            <p>Status: Healthy</p>
          </div>
          <div className="admin-card">
            <h3>Users</h3>
            <p>Active: 1</p>
          </div>
          <div className="admin-card">
            <h3>Plugins</h3>
            <p>Installed: 0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 