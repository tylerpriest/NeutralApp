import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../../../shared/ui/button';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isGuest, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }} data-testid="header">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: 0
        }}>Dashboard</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} style={{ color: '#6b7280' }} />
            <span style={{
              fontSize: '14px',
              color: '#1a1a1a',
              fontWeight: '500'
            }}>Guest User</span>
          </div>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>Guest Mode</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={16} />
          Exit Guest Mode
        </button>
      </div>
    </header>
  );
};

export default Header; 