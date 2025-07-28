import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '../../../shared/ui/button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ToastNotificationProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  onAction?: (action: ToastAction) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  toast, 
  onDismiss, 
  onAction 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match transition duration
  }, [toast.id, onDismiss]);

  const handleAction = useCallback((action: ToastAction) => {
    if (onAction) {
      onAction(action);
    }
    action.onClick();
  }, [onAction]);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-dismiss if not persistent and duration is set
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.persistent, toast.duration, handleDismiss]);

  const getIcon = () => {
    const iconClasses = "w-6 h-6 flex-shrink-0 mt-0.5";
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-600`} />;
      case 'error':
        return <XCircle className={`${iconClasses} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-600`} />;
      case 'info':
        return <Info className={`${iconClasses} text-blue-600`} />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getActionVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700';
      default:
        return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400';
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-lg border border-gray-200 mb-3 max-w-md min-w-[300px]
        transform transition-all duration-300 ease-out overflow-hidden
        ${getBorderColor()} border-l-4
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
        focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start p-4 gap-3">
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 mb-1 leading-tight">
            {toast.title}
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            {toast.message}
          </p>
          
          {toast.actions && toast.actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {toast.actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleAction(action)}
                  variant="outline"
                  size="sm"
                  className={`text-xs font-medium px-3 py-1.5 border rounded-md transition-colors ${getActionVariant(action.variant)}`}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {!toast.persistent && toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastNotification; 