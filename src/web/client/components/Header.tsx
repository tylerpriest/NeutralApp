import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="page-title">Dashboard</h2>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <span className="user-name">User</span>
            <button className="logout-button">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 