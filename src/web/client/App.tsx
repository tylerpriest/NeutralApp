import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import AppShell from './components/AppShell';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastManager';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load page components for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PluginManagerPage = lazy(() => import('./pages/PluginManagerPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <div className="app">
            <Suspense fallback={<LoadingSpinner size="large" message="Loading page..." className="page-loading" />}>
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
            </Suspense>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App; 