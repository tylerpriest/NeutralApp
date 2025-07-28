import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetErrorFallback } from '../web/WidgetErrorFallback';
import { WidgetFallback, SecuritySeverity } from '../../../shared/types';

// Mock the shared UI components
jest.mock('../../../shared/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
  buttonVariants: () => 'button-class'
}));

jest.mock('../../../shared/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className}`}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div className="card-header">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div className="card-content">
      {children}
    </div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 className="card-title">
      {children}
    </h3>
  )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => <div className={className} data-testid="alert-triangle">⚠️</div>,
  RefreshCw: ({ className }: any) => <div className={className} data-testid="refresh-icon">🔄</div>,
  X: ({ className }: any) => <div className={className} data-testid="close-icon">✕</div>,
  Bug: ({ className }: any) => <div className={className} data-testid="bug-icon">🐛</div>
}));

describe('WidgetErrorFallback', () => {
  const mockOnAction = jest.fn();
  
  const createMockFallback = (overrides: Partial<WidgetFallback> = {}): WidgetFallback => ({
    id: 'fallback-1',
    widgetId: 'widget-1',
    content: 'This widget encountered an error while loading.',
    actions: [
      {
        id: 'retry',
        label: 'Retry',
        action: () => {},
        icon: 'refresh',
        variant: 'primary'
      },
      {
        id: 'remove',
        label: 'Remove',
        action: () => {},
        icon: 'close',
        variant: 'danger'
      },
      {
        id: 'report',
        label: 'Report Issue',
        action: () => {},
        icon: 'bug',
        variant: 'secondary'
      }
    ],
    showRetry: true,
    showRemove: true,
    errorMessage: 'Error: Widget failed to load',
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the error fallback with correct content', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByText('Widget Error')).toBeInTheDocument();
      expect(screen.getByText('This widget encountered an error while loading.')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
      expect(screen.getByText('Report Issue')).toBeInTheDocument();
    });

    it('should render error details when errorMessage is provided', () => {
      const fallback = createMockFallback({
        errorMessage: 'Detailed error message'
      });
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Detailed error message')).toBeInTheDocument();
    });

    it('should not render error details when errorMessage is not provided', () => {
      const fallback = createMockFallback({
        errorMessage: undefined
      });
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction}
          className="custom-class"
        />
      );

      const card = screen.getByText('Widget Error').closest('.card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('action handling', () => {
    it('should call onAction when retry button is clicked', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockOnAction).toHaveBeenCalledWith('retry');
    });

    it('should call onAction when remove button is clicked', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockOnAction).toHaveBeenCalledWith('remove');
    });

    it('should call onAction when report button is clicked', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      const reportButton = screen.getByText('Report Issue');
      fireEvent.click(reportButton);

      expect(mockOnAction).toHaveBeenCalledWith('report');
    });
  });

  describe('icon rendering', () => {
    it('should render correct icons for each action', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
      expect(screen.getByTestId('bug-icon')).toBeInTheDocument();
    });

    it('should handle actions without icons', () => {
      const fallback = createMockFallback({
        actions: [
          {
            id: 'retry',
            label: 'Retry',
            action: () => {},
            variant: 'primary'
          }
        ]
      });
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
      // Should not crash when no icon is provided
    });
  });

  describe('accessibility', () => {
    it('should have proper button semantics', () => {
      const fallback = createMockFallback();
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('should have expandable error details', () => {
      const fallback = createMockFallback({
        errorMessage: 'Test error'
      });
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      const details = screen.getByText('Error Details').closest('details');
      expect(details).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle fallback with no actions', () => {
      const fallback = createMockFallback({
        actions: []
      });
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByText('Widget Error')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const fallback = createMockFallback({
        content: ''
      });
      
      render(
        <WidgetErrorFallback 
          fallback={fallback} 
          onAction={mockOnAction} 
        />
      );

      expect(screen.getByText('Widget Error')).toBeInTheDocument();
    });
  });
}); 