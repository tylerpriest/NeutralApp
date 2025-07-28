import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, isGuest, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="page-title">Dashboard</h2>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <span className="user-name">
              {isGuest ? 'Guest User' : (user?.name || user?.email || 'User')}
            </span>
            {isGuest && (
              <span className="guest-badge" style={{
                fontSize: '12px',
                padding: '2px 8px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: '12px',
                marginLeft: '8px'
              }}>
                Guest Mode
              </span>
            )}
            <button className="logout-button" onClick={handleLogout}>
              {isGuest ? 'Exit Guest Mode' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 