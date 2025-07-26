import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../ToastManager';

// Test component that uses the toast hook
const TestComponent: React.FC = () => {
  const toast = useToast();
  
  return (
    <div>
      <button onClick={() => toast.showSuccess('Success', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => toast.showError('Error', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => toast.showWarning('Warning', 'Please be careful')}>
        Show Warning
      </button>
      <button onClick={() => toast.showInfo('Info', 'Here is some information')}>
        Show Info
      </button>
      <button onClick={() => toast.showToast({
        type: 'success',
        title: 'Custom',
        message: 'Custom toast',
        duration: 1000
      })}>
        Show Custom
      </button>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    {children}
  </ToastProvider>
);

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children without toasts initially', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });

  it('shows success toast when showSuccess is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });
  });

  it('shows error toast when showError is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('shows warning toast when showWarning is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Warning'));

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Please be careful')).toBeInTheDocument();
    });
  });

  it('shows info toast when showInfo is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Info'));

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Here is some information')).toBeInTheDocument();
    });
  });

  it('shows custom toast when showToast is called', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Custom'));

    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByText('Custom toast')).toBeInTheDocument();
    });
  });

  it('dismisses toast when close button is clicked', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  it('auto-dismisses toast after duration', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Custom')); // 1000ms duration

    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() => {
      expect(screen.queryByText('Custom')).not.toBeInTheDocument();
    });
  });

  it('does not auto-dismiss persistent toasts', async () => {
    const TestComponentWithPersistent: React.FC = () => {
      const toast = useToast();
      
      return (
        <button onClick={() => toast.showToast({
          type: 'success',
          title: 'Persistent',
          message: 'This toast is persistent',
          persistent: true
        })}>
          Show Persistent
        </button>
      );
    };

    render(
      <TestWrapper>
        <TestComponentWithPersistent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Persistent'));

    await waitFor(() => {
      expect(screen.getByText('Persistent')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(10000); // Much longer than default duration
    });

    await waitFor(() => {
      expect(screen.getByText('Persistent')).toBeInTheDocument();
    });
  });

  it('limits maximum number of toasts', async () => {
    const TestComponentMultiple: React.FC = () => {
      const toast = useToast();
      
      return (
        <div>
          <button onClick={() => toast.showSuccess('Toast 1', 'First toast')}>
            Toast 1
          </button>
          <button onClick={() => toast.showSuccess('Toast 2', 'Second toast')}>
            Toast 2
          </button>
          <button onClick={() => toast.showSuccess('Toast 3', 'Third toast')}>
            Toast 3
          </button>
          <button onClick={() => toast.showSuccess('Toast 4', 'Fourth toast')}>
            Toast 4
          </button>
          <button onClick={() => toast.showSuccess('Toast 5', 'Fifth toast')}>
            Toast 5
          </button>
          <button onClick={() => toast.showSuccess('Toast 6', 'Sixth toast')}>
            Toast 6
          </button>
        </div>
      );
    };

    render(
      <ToastProvider maxToasts={3}>
        <TestComponentMultiple />
      </ToastProvider>
    );

    // Show 6 toasts
    fireEvent.click(screen.getByText('Toast 1'));
    fireEvent.click(screen.getByText('Toast 2'));
    fireEvent.click(screen.getByText('Toast 3'));
    fireEvent.click(screen.getByText('Toast 4'));
    fireEvent.click(screen.getByText('Toast 5'));
    fireEvent.click(screen.getByText('Toast 6'));

    await waitFor(() => {
      // Check that only the last 3 toasts are visible (maxToasts=3)
      expect(screen.getByText('Fourth toast')).toBeInTheDocument();
      expect(screen.getByText('Fifth toast')).toBeInTheDocument();
      expect(screen.getByText('Sixth toast')).toBeInTheDocument();
      expect(screen.queryByText('First toast')).not.toBeInTheDocument();
      expect(screen.queryByText('Second toast')).not.toBeInTheDocument();
      expect(screen.queryByText('Third toast')).not.toBeInTheDocument();
    });
  });

  it('handles toast actions correctly', async () => {
    const TestComponentWithActions: React.FC = () => {
      const toast = useToast();
      
      return (
        <button onClick={() => toast.showToast({
          type: 'success',
          title: 'With Actions',
          message: 'This toast has actions',
          actions: [
            { label: 'Action 1', onClick: () => console.log('action1') },
            { label: 'Action 2', onClick: () => console.log('action2'), variant: 'primary' }
          ]
        })}>
          Show With Actions
        </button>
      );
    };

    render(
      <TestWrapper>
        <TestComponentWithActions />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show With Actions'));

    await waitFor(() => {
      expect(screen.getByText('With Actions')).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });

  it('applies correct CSS classes for different toast types', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    await waitFor(() => {
      const successToast = screen.getByText('Success').closest('.toast-notification');
      const errorToast = screen.getByText('Error').closest('.toast-notification');
      
      expect(successToast).toHaveClass('success');
      expect(errorToast).toHaveClass('error');
    });
  });
}); 