import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';

const AppShell: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <Navigation />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}>
        <Header />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          backgroundColor: '#fafafa'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell; 