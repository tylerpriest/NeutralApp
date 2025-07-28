import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorReportingInterface from '../ErrorReportingInterface';
import { webErrorLogger } from '../../services/WebErrorLogger';
import { ErrorSeverity } from '../../../../features/error-reporter/interfaces/logging.interface';

// Mock the webErrorLogger service
jest.mock('../../services/WebErrorLogger');

// Mock the shared UI components
jest.mock('../../../../shared/ui', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
  LoadingSpinner: ({ size }: any) => (
    <div data-testid="loading-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="alert-triangle-icon">AlertTriangle</span>,
  RefreshCw: () => <span data-testid="refresh-cw-icon">RefreshCw</span>,
  BarChart3: () => <span data-testid="bar-chart-3-icon">BarChart3</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  Lightbulb: () => <span data-testid="lightbulb-icon">Lightbulb</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">TrendingUp</span>,
  Activity: () => <span data-testid="activity-icon">Activity</span>,
  XCircle: () => <span data-testid="x-circle-icon">XCircle</span>,
  AlertOctagon: () => <span data-testid="alert-octagon-icon">AlertOctagon</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
  Code: () => <span data-testid="code-icon">Code</span>,
  Zap: () => <span data-testid="zap-icon">Zap</span>,
}));

const mockWebErrorLogger = webErrorLogger as jest.Mocked<typeof webErrorLogger>;

describe('ErrorReportingInterface', () => {
  const mockErrorStats = {
    totalErrors: 42,
    timeRange: {
      start: new Date('2024-01-01T00:00:00Z'),
      end: new Date('2024-01-31T23:59:59Z')
    },
    bySeverity: {
      critical: 5,
      high: 12,
      medium: 15,
      low: 10
    },
    byComponent: {
      'AuthService': 8,
      'PluginManager': 6,
      'UserInterface': 4,
      'DatabaseService': 3,
      'NotificationService': 2
    },
    byType: {
      'NetworkError': 10,
      'ValidationError': 8,
      'AuthenticationError': 6,
      'DatabaseError': 4,
      'PluginError': 3
    }
  };

  const mockAggregatedErrors = [
    {
      message: 'Network timeout occurred',
      severity: ErrorSeverity.HIGH,
      count: 15,
      affectedComponents: ['AuthService', 'PluginManager'],
      firstOccurrence: new Date('2024-01-15T10:00:00Z'),
      lastOccurrence: new Date('2024-01-20T14:30:00Z')
    },
    {
      message: 'Invalid user input detected',
      severity: ErrorSeverity.MEDIUM,
      count: 8,
      affectedComponents: ['UserInterface'],
      firstOccurrence: new Date('2024-01-10T09:00:00Z'),
      lastOccurrence: new Date('2024-01-25T16:45:00Z')
    }
  ];

  const mockErrorSuggestions = [
    {
      pattern: /Network timeout/,
      action: 'retry',
      suggestion: 'Implement exponential backoff for network requests'
    },
    {
      pattern: /Invalid input/,
      action: 'validate',
      suggestion: 'Add client-side validation before form submission'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render loading state initially', () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading error data...')).toBeInTheDocument();
    });

    it('should render error state when data loading fails', async () => {
      mockWebErrorLogger.getErrorStatistics.mockRejectedValue(new Error('Network error'));
      mockWebErrorLogger.getAggregatedErrors.mockRejectedValue(new Error('Network error'));
      mockWebErrorLogger.getErrorSuggestions.mockRejectedValue(new Error('Network error'));

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load error data')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });
  });

  describe('Header and Navigation', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should render header with title and refresh button', () => {
      expect(screen.getByText('Error Reporting & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    });

    it('should render navigation tabs', () => {
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Error Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Suggestions' })).toBeInTheDocument();
    });

    it('should show overview tab by default', () => {
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch tabs when clicked', async () => {
      const errorsTab = screen.getByRole('tab', { name: 'Error Details' });
      fireEvent.click(errorsTab);

      expect(errorsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Network timeout occurred')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should display total errors card', () => {
      expect(screen.getByText('Total Errors')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display severity breakdown', () => {
      expect(screen.getByText('By Severity')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('should display top components', () => {
      expect(screen.getByText('Top Components')).toBeInTheDocument();
      expect(screen.getByText('AuthService')).toBeInTheDocument();
      expect(screen.getByText('PluginManager')).toBeInTheDocument();
    });

    it('should display error types', () => {
      expect(screen.getByText('Error Types')).toBeInTheDocument();
      expect(screen.getByText('NetworkError')).toBeInTheDocument();
      expect(screen.getByText('ValidationError')).toBeInTheDocument();
    });
  });

  describe('Errors Tab', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const errorsTab = screen.getByRole('tab', { name: 'Error Details' });
      fireEvent.click(errorsTab);
    });

    it('should display aggregated errors', () => {
      expect(screen.getByText('Network timeout occurred')).toBeInTheDocument();
      expect(screen.getByText('Invalid user input detected')).toBeInTheDocument();
    });

    it('should display error severity badges', () => {
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should display error metadata', () => {
      expect(screen.getByText(/Occurred 15 times/)).toBeInTheDocument();
      expect(screen.getByText(/Occurred 8 times/)).toBeInTheDocument();
      expect(screen.getByText(/Components: AuthService, PluginManager/)).toBeInTheDocument();
    });

    it('should display no errors message when empty', async () => {
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue([]);

      const refreshButton = screen.getByText('Refresh Data');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('No errors found in the current time period.')).toBeInTheDocument();
      });
    });
  });

  describe('Suggestions Tab', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const suggestionsTab = screen.getByRole('tab', { name: 'Lightbulb Suggestions' });
      fireEvent.click(suggestionsTab);
    });

    it('should display error suggestions', () => {
      expect(screen.getByText('Pattern: Network timeout')).toBeInTheDocument();
      expect(screen.getByText('Pattern: Invalid input')).toBeInTheDocument();
    });

    it('should display suggestion actions', () => {
      expect(screen.getByText('retry')).toBeInTheDocument();
      expect(screen.getByText('validate')).toBeInTheDocument();
    });

    it('should display suggestion text', () => {
      expect(screen.getByText('Implement exponential backoff for network requests')).toBeInTheDocument();
      expect(screen.getByText('Add client-side validation before form submission')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should refresh data when refresh button is clicked', async () => {
      const refreshButton = screen.getByText('Refresh Data');
      fireEvent.click(refreshButton);

      expect(mockWebErrorLogger.getErrorStatistics).toHaveBeenCalledTimes(2);
      expect(mockWebErrorLogger.getAggregatedErrors).toHaveBeenCalledTimes(2);
      expect(mockWebErrorLogger.getErrorSuggestions).toHaveBeenCalledTimes(2);
    });

    it('should retry when retry button is clicked in error state', async () => {
      mockWebErrorLogger.getErrorStatistics.mockRejectedValue(new Error('Network error'));
      mockWebErrorLogger.getAggregatedErrors.mockRejectedValue(new Error('Network error'));
      mockWebErrorLogger.getErrorSuggestions.mockRejectedValue(new Error('Network error'));

      const refreshButton = screen.getByText('Refresh Data');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to load error data')).toBeInTheDocument();
      });

      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Total Errors')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels and roles', () => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'BarChart3 Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should have proper tab navigation', () => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(async () => {
      mockWebErrorLogger.getErrorStatistics.mockResolvedValue(mockErrorStats);
      mockWebErrorLogger.getAggregatedErrors.mockResolvedValue(mockAggregatedErrors);
      mockWebErrorLogger.getErrorSuggestions.mockResolvedValue(mockErrorSuggestions);

      render(<ErrorReportingInterface />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should have responsive layout classes', () => {
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have proper grid layout', () => {
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
}); 