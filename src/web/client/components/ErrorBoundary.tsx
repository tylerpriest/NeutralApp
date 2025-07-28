import React, { Component, ErrorInfo, ReactNode } from 'react';
import { webErrorLogger } from '../services/WebErrorLogger';
import { ErrorSeverity } from '../../../features/error-reporter/interfaces/logging.interface';
import { Button } from '../../../shared/ui/button';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react';

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
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isRecovering: false,
      showDetails: false
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
      isRecovering: false,
      showDetails: false
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

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200" role="alert">
          <div className="text-center max-w-lg w-full">
            <div className="text-red-500 mb-6 flex justify-center">
              <AlertTriangle className="w-12 h-12" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              An unexpected error occurred. We've been notified and are working to fix it.
            </p>

            {/* Recovery Status */}
            {this.state.isRecovering && (
              <div className="flex flex-col items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-6 h-6 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">Recovering...</p>
              </div>
            )}

            {/* Error Actions */}
            <div className="flex gap-3 justify-center flex-wrap mb-8">
              <Button 
                onClick={this.handleRetry}
                disabled={this.state.isRecovering}
                className="min-w-[120px] px-6 py-3 text-sm font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              
              <Button 
                onClick={this.handleReportError}
                variant="outline"
                disabled={this.state.isRecovering}
                className="min-w-[120px] px-6 py-3 text-sm font-semibold"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>

            {/* Error Details */}
            {this.props.showDetails && this.state.error && (
              <div className="mt-8 text-left bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={this.toggleDetails}
                  className="w-full p-4 bg-gray-50 border-b border-gray-200 cursor-pointer font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  Error Details
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {this.state.showDetails && (
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Error Message</h4>
                    <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-xs leading-relaxed text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.error.message}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Component Stack</h4>
                        <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs leading-relaxed text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 