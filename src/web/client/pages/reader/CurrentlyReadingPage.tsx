import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Bookmark, 
  Edit, 
  MoreVertical,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    readingTime: number;
  };
  rating: number;
  tags: string[];
  categoryId?: string;
  estimatedTimeRemaining?: number;
}

interface ReadingStats {
  totalBooksReading: number;
  totalPagesRead: number;
  averageProgress: number;
  readingStreak: number;
  estimatedCompletion: string;
}

const CurrentlyReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<ReadingStats>({
    totalBooksReading: 0,
    totalPagesRead: 0,
    averageProgress: 0,
    readingStreak: 0,
    estimatedCompletion: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentlyReadingData();
  }, []);

  const loadCurrentlyReadingData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockBooks: Book[] = [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
          progress: { 
            currentPage: 45, 
            totalPages: 180, 
            percentage: 25, 
            lastRead: '2024-01-15T10:30:00Z',
            readingTime: 120
          },
          rating: 4,
          tags: ['fiction', 'classic', 'romance'],
          categoryId: 'fiction',
          estimatedTimeRemaining: 360
        },
        {
          id: '2',
          title: '1984',
          author: 'George Orwell',
          description: 'A dystopian social science fiction novel and cautionary tale.',
          progress: { 
            currentPage: 120, 
            totalPages: 328, 
            percentage: 37, 
            lastRead: '2024-01-14T15:20:00Z',
            readingTime: 180
          },
          rating: 5,
          tags: ['fiction', 'dystopian', 'political'],
          categoryId: 'fiction',
          estimatedTimeRemaining: 480
        },
        {
          id: '3',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          description: 'A handbook of agile software craftsmanship.',
          progress: { 
            currentPage: 15, 
            totalPages: 464, 
            percentage: 3, 
            lastRead: '2024-01-13T09:15:00Z',
            readingTime: 45
          },
          rating: 0,
          tags: ['technical', 'programming', 'software'],
          categoryId: 'technical',
          estimatedTimeRemaining: 1200
        }
      ];

      setBooks(mockBooks);

      // Calculate stats
      const totalBooksReading = mockBooks.length;
      const totalPagesRead = mockBooks.reduce((sum, book) => sum + book.progress.currentPage, 0);
      const averageProgress = mockBooks.reduce((sum, book) => sum + book.progress.percentage, 0) / mockBooks.length;
      const readingStreak = 7; // Mock streak
      const estimatedCompletion = '2 weeks'; // Mock estimation

      setStats({
        totalBooksReading,
        totalPagesRead,
        averageProgress,
        readingStreak,
        estimatedCompletion
      });
    } catch (error) {
      console.error('Failed to load currently reading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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

  const handleContinueReading = (bookId: string) => {
    navigate(`/reader/book/${bookId}`);
  };

  const handleBookDetails = (bookId: string) => {
    navigate(`/reader/book/${bookId}/details`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading your reading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📖 Currently Reading</h1>
              <p className="text-gray-600">{books.length} books in progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Books Reading</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalBooksReading}</p>
                </div>
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Pages Read</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalPagesRead}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-purple-900">{Math.round(stats.averageProgress)}%</p>
                </div>
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Reading Streak</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.readingStreak} days</p>
                </div>
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Est. Completion</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.estimatedCompletion}</p>
                </div>
                <Clock className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books in progress</h3>
            <p className="text-gray-500 mb-4">Start reading a book to see it here</p>
            <button
              onClick={() => navigate('/reader/library')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse Library
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {books.map(book => (
              <div
                key={book.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{book.title}</h3>
                          <p className="text-gray-600 mb-2">by {book.author}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{book.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Reading Progress</span>
                          <span className="text-sm text-gray-500">{book.progress.percentage}% complete</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(book.progress.percentage)}`}
                            style={{ width: `${book.progress.percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Page {book.progress.currentPage} of {book.progress.totalPages}</span>
                          <span>{book.progress.currentPage} pages remaining</span>
                        </div>
                      </div>

                      {/* Reading Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Last Read</p>
                          <p className="text-sm font-medium text-gray-900">{formatLastRead(book.progress.lastRead)}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Reading Time</p>
                          <p className="text-sm font-medium text-gray-900">{formatReadingTime(book.progress.readingTime)}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Est. Time Left</p>
                          <p className="text-sm font-medium text-gray-900">
                            {book.estimatedTimeRemaining ? formatReadingTime(book.estimatedTimeRemaining) : 'Unknown'}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Reading Speed</p>
                          <p className="text-sm font-medium text-gray-900">
                            {Math.round(book.progress.currentPage / (book.progress.readingTime / 60))} pages/min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleContinueReading(book.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Continue Reading
                      </button>
                      
                      <button
                        onClick={() => handleBookDetails(book.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentlyReadingPage; 