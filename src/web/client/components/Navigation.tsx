import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="nav-title">NeutralApp</h1>
      </div>
      <ul className="nav-list">
        <li>
          <NavLink to="/" className="nav-link" end>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/plugins" className="nav-link">
            Plugins
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className="nav-link">
            Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin" className="nav-link">
            Admin
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 