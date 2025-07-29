/**
 * Reading Library Widget - Best Practice Implementation
 * Provides essential library overview with search and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Book, BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  readingProgress: {
    currentPosition: number;
    isCompleted: boolean;
  };
  categories: string[];
}

interface LibraryStats {
  totalBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  totalReadingTime: number;
}

interface ReadingLibraryWidgetProps {
  pluginAPI?: any;
  config?: {
    showSearch?: boolean;
    showCategories?: boolean;
    viewMode?: 'grid' | 'list';
    limit?: number;
  };
}

const ReadingLibraryWidget: React.FC<ReadingLibraryWidgetProps> = ({ 
  pluginAPI, 
  config = { showSearch: true, showCategories: true, viewMode: 'grid', limit: 6 } 
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    completedBooks: 0,
    inProgressBooks: 0,
    totalReadingTime: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      
      // Get reading-core API if available
      if (pluginAPI?.getPluginAPI) {
        const readingAPI = pluginAPI.getPluginAPI('reading-core');
        if (readingAPI) {
          const [allBooks, libraryStats] = await Promise.all([
            readingAPI.library.getAllBooks(),
            readingAPI.library.getLibraryStats()
          ]);
          
          setBooks(allBooks.slice(0, config.limit || 6));
          setStats(libraryStats);
        }
      } else {
        // Fallback mock data for development
        setBooks([
          {
            id: '1',
            title: 'The Art of Programming',
            author: 'Jane Developer',
            categories: ['Technical'],
            readingProgress: { currentPosition: 0.65, isCompleted: false }
          },
          {
            id: '2',
            title: 'Design Patterns',
            author: 'Gang of Four',
            categories: ['Technical'],
            readingProgress: { currentPosition: 1.0, isCompleted: true }
          }
        ]);
        setStats({
          totalBooks: 12,
          completedBooks: 8,
          inProgressBooks: 3,
          totalReadingTime: 240
        });
      }
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    // Navigate to reading interface or book details
    if (pluginAPI?.navigate) {
      pluginAPI.navigate(`/reader/book/${book.id}`);
    }
  };

  const handleAddBook = () => {
    if (pluginAPI?.navigate) {
      pluginAPI.navigate('/reader/import');
    }
  };

  const handleViewAll = () => {
    if (pluginAPI?.navigate) {
      pluginAPI.navigate('/reader/library');
    }
  };

  const filteredBooks = books.filter(book =>
    searchTerm === '' || 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px'
      }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <Book size={32} style={{ marginBottom: '8px' }} />
          <div>Loading library...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '8px'
    }}>
      {/* Header with Stats */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#1F2937'
          }}>
            📚 Book Library
          </h3>
          
          <button
            onClick={handleAddBook}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            Add Book
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{stats.totalBooks}</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#F0FDF4', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#16A34A' }}>{stats.completedBooks}</div>
            <div style={{ fontSize: '10px', color: '#16A34A' }}>Done</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#FEF3C7', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#D97706' }}>{stats.inProgressBooks}</div>
            <div style={{ fontSize: '10px', color: '#D97706' }}>Reading</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#EDE9FE', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#7C3AED' }}>{Math.round(stats.totalReadingTime / 60)}h</div>
            <div style={{ fontSize: '10px', color: '#7C3AED' }}>Time</div>
          </div>
        </div>
      </div>

      {/* Search */}
      {config.showSearch && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 28px',
                fontSize: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filteredBooks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6B7280'
          }}>
            <BookOpen size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div style={{ fontSize: '12px' }}>
              {searchTerm ? 'No books match your search' : 'No books in library'}
            </div>
            {!searchTerm && (
              <button
                onClick={handleAddBook}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Import your first book
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: config.viewMode === 'grid' ? 'repeat(auto-fill, minmax(120px, 1fr))' : '1fr',
            gap: '12px'
          }}>
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                style={{
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Book Cover or Icon */}
                <div style={{
                  width: '100%',
                  height: '80px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {!book.coverUrl && <Book size={24} color="#9CA3AF" />}
                </div>

                {/* Book Info */}
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                  {book.title.length > 25 ? `${book.title.substring(0, 25)}...` : book.title}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '6px' }}>
                  {book.author}
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '3px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div
                    style={{
                      width: `${book.readingProgress.currentPosition * 100}%`,
                      height: '100%',
                      backgroundColor: book.readingProgress.isCompleted ? '#16A34A' : '#3B82F6',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '9px', color: '#6B7280' }}>
                    {Math.round(book.readingProgress.currentPosition * 100)}%
                  </span>
                  {book.readingProgress.isCompleted ? (
                    <CheckCircle2 size={12} color="#16A34A" />
                  ) : book.readingProgress.currentPosition > 0 ? (
                    <Clock size={12} color="#3B82F6" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredBooks.length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <button
            onClick={handleViewAll}
            style={{
              padding: '6px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            View All Books →
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadingLibraryWidget;