import React, { useState, useEffect } from 'react';
import { webErrorLogger } from '../services/WebErrorLogger';
import { ErrorStatistics, AggregatedError, ErrorSuggestion } from '../../../features/error-reporter/interfaces/logging.interface';
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingSpinner } from '../../../shared/ui';
import {
  AlertTriangle,
  RefreshCw,
  BarChart3,
  AlertCircle,
  Lightbulb,
  Clock,
  TrendingUp,
  Activity,
  XCircle,
  AlertOctagon,
  Info,
  CheckCircle,
  Calendar,
  Users,
  Code,
  Zap
} from 'lucide-react';

interface ErrorReportingInterfaceProps {
  className?: string;
}

const ErrorReportingInterface: React.FC<ErrorReportingInterfaceProps> = ({ className = '' }) => {
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [aggregatedErrors, setAggregatedErrors] = useState<AggregatedError[]>([]);
  const [errorSuggestions, setErrorSuggestions] = useState<ErrorSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'suggestions'>('overview');

  useEffect(() => {
    loadErrorData();
  }, []);

  const loadErrorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, errors, suggestions] = await Promise.all([
        webErrorLogger.getErrorStatistics(),
        webErrorLogger.getAggregatedErrors(),
        webErrorLogger.getErrorSuggestions()
      ]);

      setErrorStats(stats);
      setAggregatedErrors(errors);
      setErrorSuggestions(suggestions);
    } catch (err) {
      setError('Failed to load error data');
      console.error('Error loading error data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error bg-error-light border-error/20';
      case 'high': return 'text-warning bg-warning-light border-warning/20';
      case 'medium': return 'text-info bg-info-light border-info/20';
      case 'low': return 'text-success bg-success-light border-success/20';
      default: return 'text-info bg-info-light border-info/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertOctagon className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-border overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-medium">Loading error data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-border overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={loadErrorData} variant="default" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'errors', label: 'Error Details', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'suggestions', label: 'Suggestions', icon: <Lightbulb className="w-5 h-5" /> }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            Error Reporting & Analytics
          </h2>
          <Button 
            onClick={loadErrorData} 
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-gray-medium hover:text-gray-dark hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6" role="tabpanel">
        {activeTab === 'overview' && errorStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    Total Errors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold text-red-600">{errorStats.totalErrors}</div>
                  <div className="text-sm text-gray-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(errorStats.timeRange.start)} - {formatDate(errorStats.timeRange.end)}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    By Severity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(errorStats.bySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(severity)}
                        <span className="font-medium capitalize">{severity}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-info-light rounded-lg">
                  <Code className="w-5 h-5 text-info" />
                </div>
                    Top Components
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(errorStats.byComponent)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([component, count]) => (
                      <div key={component} className="flex items-center justify-between">
                        <span className="font-medium truncate">{component}</span>
                        <span className="font-semibold text-info">{count}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    Error Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(errorStats.byType)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="font-medium truncate">{type}</span>
                        <span className="font-semibold text-purple-600">{count}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-6">
            {aggregatedErrors.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-medium">No errors found in the current time period.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aggregatedErrors.map((error, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-dark flex-1 mr-4">
                          {error.message}
                        </h4>
                        <span className={`px-3 py-1 rounded-full border text-sm font-semibold uppercase ${getSeverityColor(error.severity)}`}>
                          {error.severity}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-medium">
                          <span className="flex items-center gap-2 font-semibold text-info">
                            <Zap className="w-4 h-4" />
                            Occurred {error.count} times
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Components: {error.affectedComponents.join(', ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-medium">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            First: {formatDate(error.firstOccurrence)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Last: {formatDate(error.lastOccurrence)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {errorSuggestions.map((suggestion, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-dark">
                        Pattern: {suggestion.pattern.source}
                      </h4>
                      <span className="px-3 py-1 rounded-full bg-info-light text-info text-sm font-semibold uppercase">
                        {suggestion.action}
                      </span>
                    </div>
                    <p className="text-gray-medium leading-relaxed">{suggestion.suggestion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorReportingInterface; 