import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

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
              {user?.name || user?.email || 'User'}
            </span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 