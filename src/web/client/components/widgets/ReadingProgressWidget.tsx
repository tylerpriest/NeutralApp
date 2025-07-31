import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, BookOpen, Target, Calendar, BarChart3 } from 'lucide-react';

interface ReadingStats {
  totalBooks: number;
  completedBooks: number;
  readingBooks: number;
  toReadBooks: number;
  totalPages: number;
  pagesRead: number;
  averageRating: number;
  totalReadingTime: number;
  averageSpeed: number;
  readingStreak: number;
  favoriteGenres: string[];
}

interface ReadingProgressWidgetProps {
  data?: {
    stats?: ReadingStats;
    recentActivity?: Array<{
      type: string;
      bookTitle: string;
      timestamp: string;
    }>;
  };
}

const ReadingProgressWidget: React.FC<ReadingProgressWidgetProps> = ({ data }) => {
  const [stats, setStats] = useState<ReadingStats>({
    totalBooks: 0,
    completedBooks: 0,
    readingBooks: 0,
    toReadBooks: 0,
    totalPages: 0,
    pagesRead: 0,
    averageRating: 0,
    totalReadingTime: 0,
    averageSpeed: 0,
    readingStreak: 0,
    favoriteGenres: []
  });
  const [recentActivity, setRecentActivity] = useState(data?.recentActivity || []);

  useEffect(() => {
    if (data?.stats) {
      setStats(data.stats);
    }
    if (data?.recentActivity) {
      setRecentActivity(data.recentActivity);
    }
  }, [data]);

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatSpeed = (speed: number) => {
    return `${Math.round(speed)} pages/min`;
  };

  const getProgressPercentage = () => {
    if (stats.totalPages === 0) return 0;
    return Math.round((stats.pagesRead / stats.totalPages) * 100);
  };

  const getCompletionRate = () => {
    if (stats.totalBooks === 0) return 0;
    return Math.round((stats.completedBooks / stats.totalBooks) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📊 Reading Progress</h3>
            <p className="text-sm text-gray-500">Your reading journey</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Pages Read</p>
              <p className="text-2xl font-bold text-blue-900">{stats.pagesRead.toLocaleString()}</p>
            </div>
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-blue-600">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Books Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completedBooks}</p>
            </div>
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-green-600">
              <span>Completion Rate</span>
              <span>{getCompletionRate()}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-1">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionRate()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reading Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total Reading Time</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{formatReadingTime(stats.totalReadingTime)}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Average Speed</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{formatSpeed(stats.averageSpeed)}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Reading Streak</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{stats.readingStreak} days</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Currently Reading</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{stats.readingBooks} books</span>
        </div>
      </div>

      {/* Book Status Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Book Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totalBooks > 0 ? (stats.completedBooks / stats.totalBooks) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{stats.completedBooks}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Reading</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${stats.totalBooks > 0 ? (stats.readingBooks / stats.totalBooks) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{stats.readingBooks}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">To Read</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${stats.totalBooks > 0 ? (stats.toReadBooks / stats.totalBooks) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{stats.toReadBooks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      {stats.favoriteGenres.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Favorite Genres</h4>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteGenres.slice(0, 5).map((genre, index) => (
              <span
                key={genre}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.bookTitle}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalBooks === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">No reading data yet</h4>
          <p className="text-xs text-gray-500">Start reading to see your progress</p>
        </div>
      )}
    </div>
  );
};

export default ReadingProgressWidget; 