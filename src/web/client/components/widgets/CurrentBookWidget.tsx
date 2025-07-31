import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Clock, Star, Bookmark, Edit } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
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

interface CurrentBookWidgetProps {
  data?: {
    currentBook?: Book;
  };
}

const CurrentBookWidget: React.FC<CurrentBookWidgetProps> = ({ data }) => {
  const [currentBook, setCurrentBook] = useState<Book | null>(data?.currentBook || null);
  const [loading, setLoading] = useState(!data?.currentBook);

  useEffect(() => {
    if (data?.currentBook) {
      setCurrentBook(data.currentBook);
    } else {
      loadCurrentBook();
    }
  }, [data]);

  const loadCurrentBook = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockBook: Book = {
        id: '1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
        progress: {
          currentPage: 45,
          totalPages: 180,
          percentage: 25,
          lastRead: '2024-01-15T10:30:00Z'
        },
        rating: 4,
        categoryId: 'fiction'
      };
      
      setCurrentBook(mockBook);
    } catch (error) {
      console.error('Failed to load current book:', error);
    } finally {
      setLoading(false);
    }
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

  const handleContinueReading = () => {
    if (currentBook) {
      // Navigate to reading interface
      window.location.href = `/reader/book/${currentBook.id}`;
    }
  };

  const handleBookDetails = () => {
    if (currentBook) {
      // Navigate to book details
      window.location.href = `/reader/book/${currentBook.id}/details`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading current book...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No book in progress</h3>
          <p className="text-gray-500 mb-4">Start reading to see your current book here</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <BookOpen className="w-4 h-4" />
            Browse Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📖 Currently Reading</h3>
            <p className="text-sm text-gray-500">Continue where you left off</p>
          </div>
        </div>
      </div>

      {/* Book Info */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 mb-1">{currentBook.title}</h4>
          <p className="text-gray-600 mb-2">by {currentBook.author}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{currentBook.description}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < currentBook.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-2">{currentBook.rating}/5</span>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Reading Progress</span>
            <span className="text-sm text-gray-500">{currentBook.progress.percentage}% complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(currentBook.progress.percentage)}`}
              style={{ width: `${currentBook.progress.percentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Page {currentBook.progress.currentPage} of {currentBook.progress.totalPages}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastRead(currentBook.progress.lastRead)}
            </span>
          </div>
        </div>

        {/* Reading Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Pages Read</p>
            <p className="text-lg font-semibold text-gray-900">{currentBook.progress.currentPage}</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">Pages Left</p>
            <p className="text-lg font-semibold text-gray-900">{currentBook.progress.totalPages - currentBook.progress.currentPage}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleContinueReading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Continue Reading
          </button>
          
          <button
            onClick={handleBookDetails}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentBookWidget; 