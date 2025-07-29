import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, Settings, Shield } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav style={{
      width: '256px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }} data-testid="navigation">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          margin: 0
        }}>NeutralApp</h1>
      </div>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <li>
          <NavLink 
            to="/" 
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              color: isActive ? '#1a1a1a' : '#6b7280',
              backgroundColor: isActive ? '#f3f4f6' : 'transparent'
            })}
          >
            <Home size={20} style={{ marginRight: '12px' }} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/plugins" 
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              color: isActive ? '#1a1a1a' : '#6b7280',
              backgroundColor: isActive ? '#f3f4f6' : 'transparent'
            })}
          >
            <Package size={20} style={{ marginRight: '12px' }} />
            Plugins
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/settings" 
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              color: isActive ? '#1a1a1a' : '#6b7280',
              backgroundColor: isActive ? '#f3f4f6' : 'transparent'
            })}
          >
            <Settings size={20} style={{ marginRight: '12px' }} />
            Settings
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin" 
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              color: isActive ? '#1a1a1a' : '#6b7280',
              backgroundColor: isActive ? '#f3f4f6' : 'transparent'
            })}
          >
            <Shield size={20} style={{ marginRight: '12px' }} />
            Admin
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 