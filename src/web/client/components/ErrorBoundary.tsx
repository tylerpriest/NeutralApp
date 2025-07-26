import React, { Component, ErrorInfo, ReactNode } from 'react';
import { webErrorLogger } from '../services/WebErrorLogger';
import { ErrorSeverity } from '../../../features/error-reporter/interfaces/logging.interface';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isRecovering: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log the error using WebErrorLogger
    webErrorLogger.logReactError(error, errorInfo, this.constructor.name);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false
    });
  };

  private handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      // Log user-reported error with additional context
      webErrorLogger.logWebError({
        error: this.state.error,
        context: {
          component: this.constructor.name,
          action: 'user-reported-error',
          metadata: {
            userReported: true,
            componentStack: this.state.errorInfo.componentStack
          }
        },
        userFacing: false,
        severity: ErrorSeverity.MEDIUM
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            
            <h2>Something went wrong</h2>
            <p>We encountered an unexpected error. Our team has been notified and is working to fix it.</p>
            
            {this.state.isRecovering && (
              <div className="recovery-status">
                <div className="loading-spinner"></div>
                <p>Attempting to recover...</p>
              </div>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
                disabled={this.state.isRecovering}
              >
                Try Again
              </button>
              
              <button 
                onClick={this.handleReportError}
                className="report-button"
                disabled={this.state.isRecovering}
              >
                Report Issue
              </button>
            </div>
            
            {this.props.showDetails && this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <div className="error-stack">
                  <h4>Error Message:</h4>
                  <pre>{this.state.error.message}</pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4>Stack Trace:</h4>
                      <pre>{this.state.error.stack}</pre>
                    </>
                  )}
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 