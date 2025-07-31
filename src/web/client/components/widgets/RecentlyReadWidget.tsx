/**
 * Recently Read Widget - Best Practice Implementation  
 * Shows recent reading activity with quick resume functionality
 */

import React, { useState, useEffect } from 'react';
import { Clock, Play, BookOpen, Star, Calendar } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  progress: {
    currentPage: number;
    totalPages: number;
    percentage: number;
    lastRead: string | null;
  };
  rating: number;
  categoryId?: string;
}

interface RecentlyReadWidgetProps {
  data?: {
    books?: Book[];
    categories?: Array<{ id: string; name: string; color: string; icon: string }>;
  };
}

const RecentlyReadWidget: React.FC<RecentlyReadWidgetProps> = ({ data }) => {
  const [books, setBooks] = useState<Book[]>(data?.books || []);
  const [categories, setCategories] = useState(data?.categories || []);

  useEffect(() => {
    if (data?.books) {
      setBooks(data.books);
    }
    if (data?.categories) {
      setCategories(data.categories);
    }
  }, [data]);

  const recentlyReadBooks = books
    .filter(book => book.progress.lastRead)
    .sort((a, b) => {
      const dateA = a.progress.lastRead ? new Date(a.progress.lastRead).getTime() : 0;
      const dateB = b.progress.lastRead ? new Date(b.progress.lastRead).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getCategoryIcon = (categoryId?: string) => {
    if (!categoryId) return '📚';
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📚';
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const formatLastRead = (lastRead: string | null) => {
    if (!lastRead) return 'Never read';
    const date = new Date(lastRead);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🕒 Recently Read</h3>
            <p className="text-sm text-gray-500">Continue where you left off</p>
          </div>
        </div>
      </div>

      {/* Recently Read Books */}
      {recentlyReadBooks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">No recent reading</h4>
          <p className="text-xs text-gray-500">Start reading to see your recent books</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentlyReadBooks.map(book => (
            <div
              key={book.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* Book Cover/Icon */}
              <div className="flex-shrink-0">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-lg">{getCategoryIcon(book.categoryId)}</span>
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{book.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress and Last Read */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-medium text-gray-700">{book.progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(book.progress.percentage)}`}
                      style={{ width: `${book.progress.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatLastRead(book.progress.lastRead)}
                    </span>
                    <span>{book.progress.currentPage}/{book.progress.totalPages} pages</span>
                  </div>
                </div>
              </div>

              {/* Continue Reading Button */}
              <div className="flex-shrink-0">
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {recentlyReadBooks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All Recently Read
          </button>
        </div>
      )}

      {/* Reading Streak */}
      {recentlyReadBooks.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Reading Streak</p>
              <p className="text-xs text-gray-600">Keep up the momentum!</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                {recentlyReadBooks.filter(book => {
                  const lastRead = book.progress.lastRead ? new Date(book.progress.lastRead) : null;
                  const today = new Date();
                  return lastRead && lastRead.toDateString() === today.toDateString();
                }).length > 0 ? '🔥' : '📚'}
              </p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentlyReadWidget;