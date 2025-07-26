import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastNotification, { ToastMessage, ToastType, ToastAction } from './ToastNotification';
import './ToastNotification.css';

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  showSuccess: (title: string, message: string, options?: Partial<ToastMessage>) => void;
  showError: (title: string, message: string, options?: Partial<ToastMessage>) => void;
  showWarning: (title: string, message: string, options?: Partial<ToastMessage>) => void;
  showInfo: (title: string, message: string, options?: Partial<ToastMessage>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5, 
  defaultDuration = 5000 
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: generateId(),
      duration: toast.duration ?? defaultDuration
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Keep only the most recent toasts up to maxToasts
      return updatedToasts.slice(0, maxToasts);
    });
  }, [generateId, defaultDuration, maxToasts]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<ToastMessage>) => {
    showToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [showToast]);

  const showError = useCallback((title: string, message: string, options?: Partial<ToastMessage>) => {
    showToast({
      type: 'error',
      title,
      message,
      ...options
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<ToastMessage>) => {
    showToast({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<ToastMessage>) => {
    showToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [showToast]);

  const handleToastAction = useCallback((action: ToastAction) => {
    // Handle toast actions if needed
    console.log('Toast action triggered:', action);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    dismissToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onAction={handleToastAction}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider; 