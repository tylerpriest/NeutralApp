import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from '../AdminPage';

// Mock the services
jest.mock('../../../../features/admin/services/admin.dashboard');
jest.mock('../../../../features/admin/services/system.monitor');
jest.mock('../../../../features/admin/services/user.manager');
jest.mock('../../../../features/admin/services/system.report.generator');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AdminPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render admin dashboard with main sections', async () => {
      renderWithProviders(<AdminPage />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('System monitoring and administration')).toBeInTheDocument();
    });

    it('should show loading state initially', async () => {
      renderWithProviders(<AdminPage />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading admin data...')).toBeInTheDocument();
    });
  });

  describe('Navigation and Tabs', () => {
    it('should show navigation tabs for different sections', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'System Monitor' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'User Management' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Plugin Management' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Reports' })).toBeInTheDocument();
      });
    });

    it('should show overview tab by default', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        const overviewTab = screen.getByRole('tab', { name: 'Overview' });
        expect(overviewTab).toHaveClass('active');
      });
    });

    it('should switch to system monitor tab when clicked', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        const monitorTab = screen.getByRole('tab', { name: 'System Monitor' });
        fireEvent.click(monitorTab);
        
        expect(monitorTab).toHaveClass('active');
        expect(screen.getByText('Resource Usage')).toBeInTheDocument();
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Error Statistics')).toBeInTheDocument();
      });
    });

    it('should switch to user management tab when clicked', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        const userTab = screen.getByRole('tab', { name: 'User Management' });
        fireEvent.click(userTab);
        
        expect(userTab).toHaveClass('active');
        expect(screen.getByText('User List')).toBeInTheDocument();
      });
    });

    it('should switch to plugin management tab when clicked', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        const pluginTab = screen.getByRole('tab', { name: 'Plugin Management' });
        fireEvent.click(pluginTab);
        
        expect(pluginTab).toHaveClass('active');
        expect(screen.getByText('Plugin Health')).toBeInTheDocument();
      });
    });

    it('should switch to reports tab when clicked', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        const reportsTab = screen.getByRole('tab', { name: 'Reports' });
        fireEvent.click(reportsTab);
        
        expect(reportsTab).toHaveClass('active');
        expect(screen.getByText('System Reports')).toBeInTheDocument();
        expect(screen.getByText('Generate Report')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderWithProviders(<AdminPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      });
    });
  });
}); 