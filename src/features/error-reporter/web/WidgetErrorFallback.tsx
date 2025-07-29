import React from 'react';
import { AlertTriangle, RefreshCw, X, Bug } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { 
  WidgetError, 
  WidgetFallback, 
  WidgetFallbackAction, 
  SecuritySeverity 
} from '../../../shared/types';

interface WidgetErrorFallbackProps {
  fallback: WidgetFallback;
  onAction: (actionId: string) => void;
  className?: string;
}

const getSeverityIcon = (severity: SecuritySeverity) => {
  switch (severity) {
    case SecuritySeverity.CRITICAL:
    case SecuritySeverity.HIGH:
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case SecuritySeverity.MEDIUM:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case SecuritySeverity.LOW:
      return <AlertTriangle className="h-5 w-5 text-info" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
};

const getActionIcon = (icon?: string) => {
  switch (icon) {
    case 'refresh':
      return <RefreshCw className="h-4 w-4" />;
    case 'close':
      return <X className="h-4 w-4" />;
    case 'bug':
      return <Bug className="h-4 w-4" />;
    default:
      return null;
  }
};

const getButtonVariant = (variant?: string) => {
  switch (variant) {
    case 'primary':
      return 'default';
    case 'danger':
      return 'destructive';
    case 'secondary':
    default:
      return 'secondary';
  }
};

export const WidgetErrorFallback: React.FC<WidgetErrorFallbackProps> = ({
  fallback,
  onAction,
  className = ''
}) => {
  const handleAction = (actionId: string) => {
    onAction(actionId);
  };

  return (
    <Card className={`widget-error-fallback border-red-200 bg-red-50/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {getSeverityIcon(SecuritySeverity.MEDIUM)}
          <CardTitle className="text-lg font-semibold text-gray-900">
            Widget Error
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {fallback.content}
        </p>
        
        {fallback.errorMessage && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs text-gray-800 overflow-x-auto border">
              {fallback.errorMessage}
            </pre>
          </details>
        )}
        
        {fallback.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {fallback.actions.map((action) => (
              <Button
                key={action.id}
                variant={getButtonVariant(action.variant)}
                size="sm"
                onClick={() => handleAction(action.id)}
                className="flex items-center gap-2"
              >
                {getActionIcon(action.icon)}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetErrorFallback; 