import React, { useState, useEffect } from 'react';
import { webErrorLogger } from '../services/WebErrorLogger';
import { ErrorStatistics, AggregatedError, ErrorSuggestion } from '../../../features/error-reporter/interfaces/logging.interface';
import './ErrorReportingInterface.css';

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
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-medium';
    }
  };

  if (loading) {
    return (
      <div className={`error-reporting-interface ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading error data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`error-reporting-interface ${className}`}>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadErrorData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`error-reporting-interface ${className}`}>
      <div className="error-reporting-header">
        <h2>Error Reporting & Analytics</h2>
        <button onClick={loadErrorData} className="refresh-button">
          Refresh Data
        </button>
      </div>

      <div className="error-reporting-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          Error Details
        </button>
        <button
          className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </button>
      </div>

      <div className="error-reporting-content">
        {activeTab === 'overview' && errorStats && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Errors</h3>
                <div className="stat-value">{errorStats.totalErrors}</div>
                <div className="stat-period">
                  {formatDate(errorStats.timeRange.start)} - {formatDate(errorStats.timeRange.end)}
                </div>
              </div>

              <div className="stat-card">
                <h3>By Severity</h3>
                <div className="severity-breakdown">
                  {Object.entries(errorStats.bySeverity).map(([severity, count]) => (
                    <div key={severity} className={`severity-item ${getSeverityColor(severity)}`}>
                      <span className="severity-label">{severity}</span>
                      <span className="severity-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <h3>Top Components</h3>
                <div className="component-breakdown">
                  {Object.entries(errorStats.byComponent)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([component, count]) => (
                      <div key={component} className="component-item">
                        <span className="component-name">{component}</span>
                        <span className="component-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="stat-card">
                <h3>Error Types</h3>
                <div className="type-breakdown">
                  {Object.entries(errorStats.byType)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="type-item">
                        <span className="type-name">{type}</span>
                        <span className="type-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="errors-tab">
            <div className="errors-list">
              {aggregatedErrors.length === 0 ? (
                <div className="no-errors">
                  <p>No errors found in the current time period.</p>
                </div>
              ) : (
                aggregatedErrors.map((error, index) => (
                  <div key={index} className="error-item">
                    <div className="error-header">
                      <h4 className="error-message">{error.message}</h4>
                      <div className={`error-severity ${getSeverityColor(error.severity)}`}>
                        {error.severity}
                      </div>
                    </div>
                    
                    <div className="error-details">
                      <div className="error-meta">
                        <span className="error-count">Occurred {error.count} times</span>
                        <span className="error-components">
                          Components: {error.affectedComponents.join(', ')}
                        </span>
                      </div>
                      
                      <div className="error-timeline">
                        <span>First: {formatDate(error.firstOccurrence)}</span>
                        <span>Last: {formatDate(error.lastOccurrence)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-tab">
            <div className="suggestions-list">
              {errorSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-header">
                    <h4>Pattern: {suggestion.pattern.source}</h4>
                    <div className="suggestion-action">{suggestion.action}</div>
                  </div>
                  <p className="suggestion-text">{suggestion.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorReportingInterface; 