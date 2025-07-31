/**
 * Dashboard UX Test Page
 * Demonstrates automated UX analysis against design guidelines
 */

import React, { useState, useEffect } from 'react';
import { dashboardUXAnalyzer, UXAnalysisResult } from '../services/DashboardUXAnalyzer';
import { Activity, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

const DashboardUXTestPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<UXAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string>('');

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await dashboardUXAnalyzer.analyzeDashboard();
      setAnalysis(result);
      setReport(dashboardUXAnalyzer.generateReport());
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard UX Analysis</h1>
          <p className="text-gray-600">
            Automated analysis of dashboard layout and UX against design guidelines
          </p>
        </div>

        {/* Analysis Controls */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Controls</h2>
              <p className="text-gray-600">
                Run automated UX analysis against Material Design, Apple HIG, and other guidelines
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>

        {analysis && (
          <>
            {/* Overall Score */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Overall Score</h2>
                {getScoreIcon(analysis.overallScore)}
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}
                </div>
                <div className="text-gray-600">out of 100</div>
              </div>
            </div>

            {/* Design Guideline Scores */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Guideline Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.designGuidelineScores).map(([guideline, score]) => (
                  <div key={guideline} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {guideline.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      {getScoreIcon(score)}
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <div className="text-sm text-gray-600">/ 100</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Issues */}
            {analysis.criticalIssues.length > 0 && (
              <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Critical Issues</h2>
                <div className="space-y-4">
                  {analysis.criticalIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">{issue.title}</h3>
                          <p className="text-sm mt-1">{issue.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              {issue.category}
                            </span>
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              {issue.guideline}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{rec.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{rec.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Implementation:</span>
                          <p className="text-gray-600">{rec.implementation}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Impact:</span>
                          <p className="text-gray-600">{rec.impact}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Effort:</span>
                          <p className="text-gray-600 capitalize">{rec.effort}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Report */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Report</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{report}</pre>
              </div>
            </div>
          </>
        )}

        {/* Design Guidelines Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Guidelines Evaluated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Material Design</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Grid system and spacing</li>
                <li>• Typography and color usage</li>
                <li>• Component patterns</li>
                <li>• Interaction patterns</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Apple HIG</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clarity and visual hierarchy</li>
                <li>• Content-focused design</li>
                <li>• Depth and layering</li>
                <li>• Direct manipulation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Reading App Design</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Distraction-free reading</li>
                <li>• Typography and readability</li>
                <li>• Simple navigation</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Notion</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Minimalism and clean design</li>
                <li>• Flexible layouts</li>
                <li>• Clear organization</li>
                <li>• Collaboration features</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Plex</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Media organization</li>
                <li>• Visual browsing</li>
                <li>• Search and discovery</li>
                <li>• Navigation patterns</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Stremio</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Content discovery</li>
                <li>• Visual browsing</li>
                <li>• Quick actions</li>
                <li>• Personalization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUXTestPage; 