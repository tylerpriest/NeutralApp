import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import AppShell from './components/AppShell';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PluginManagerPage from './pages/PluginManagerPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="plugins" element={<PluginManagerPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App; 