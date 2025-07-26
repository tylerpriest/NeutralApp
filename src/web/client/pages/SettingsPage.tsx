import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <div className="settings-content">
        <h1>Settings</h1>
        <p>Configure your application preferences</p>
        <div className="settings-form">
          <div className="setting-group">
            <label>Theme</label>
            <select className="setting-input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="setting-group">
            <label>Language</label>
            <select className="setting-input">
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 