import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Search, 
  Bookmark, 
  Settings, 
  TrendingUp, 
  Clock,
  Star,
  Download,
  Share,
  Target,
  Calendar,
  Book,
  FileText
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface QuickActionsWidgetProps {
  data?: {
    recentBooks?: Array<{ id: string; title: string; author: string }>;
    readingStats?: {
      totalBooks: number;
      completedBooks: number;
      readingBooks: number;
      readingStreak: number;
    };
  };
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ data }) => {
  const [recentBooks] = useState(data?.recentBooks || []);
  const [readingStats] = useState(data?.readingStats || {
    totalBooks: 12,
    completedBooks: 3,
    readingBooks: 2,
    readingStreak: 7
  });

  const quickActions: QuickAction[] = [
    {
      id: 'add-book',
      title: 'Add Book',
      description: 'Add a new book to your library',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-500',
      action: () => {
        // Navigate to add book page
        window.location.href = '/reader/add-book';
      }
    },
    {
      id: 'import-books',
      title: 'Import Books',
      description: 'Import books from files or URLs',
      icon: <Upload className="w-5 h-5" />,
      color: 'bg-green-500',
      action: () => {
        // Navigate to import page
        window.location.href = '/reader/import';
      }
    },
    {
      id: 'search-library',
      title: 'Search Library',
      description: 'Find books in your collection',
      icon: <Search className="w-5 h-5" />,
      color: 'bg-purple-500',
      action: () => {
        // Navigate to library with search focus
        window.location.href = '/reader/library?search=true';
      }
    },
    {
      id: 'reading-settings',
      title: 'Reading Settings',
      description: 'Customize your reading experience',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-orange-500',
      action: () => {
        // Navigate to settings page
        window.location.href = '/reader/settings';
      }
    },
    {
      id: 'reading-analytics',
      title: 'Reading Analytics',
      description: 'View your reading statistics',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-indigo-500',
      action: () => {
        // Navigate to analytics page
        window.location.href = '/reader/analytics';
      }
    },
    {
      id: 'reading-goals',
      title: 'Reading Goals',
      description: 'Set and track reading goals',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-pink-500',
      action: () => {
        // Navigate to goals page
        window.location.href = '/reader/goals';
      }
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    action.action();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h3>
            <p className="text-sm text-gray-500">Quick access to reading features</p>
          </div>
        </div>
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600">Total Books</p>
              <p className="text-lg font-bold text-blue-900">{readingStats.totalBooks}</p>
            </div>
            <Book className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600">Reading Streak</p>
              <p className="text-lg font-bold text-green-900">{readingStats.readingStreak} days</p>
            </div>
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 mb-1">{action.title}</h4>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Books */}
      {recentBooks.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Books</h4>
          <div className="space-y-2">
            {recentBooks.slice(0, 3).map(book => (
              <button
                key={book.id}
                onClick={() => {
                  window.location.href = `/reader/book/${book.id}`;
                }}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 truncate">by {book.author}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Actions */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center space-y-1 p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors">
            <Bookmark className="w-4 h-4" />
            <span>Bookmarks</span>
          </button>
          
          <button className="flex flex-col items-center space-y-1 p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button className="flex flex-col items-center space-y-1 p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsWidget; 