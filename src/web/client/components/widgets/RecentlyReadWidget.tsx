/**
 * Recently Read Widget - Best Practice Implementation  
 * Shows recent reading activity with quick resume functionality
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Play, TrendingUp } from 'lucide-react';

interface RecentBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  readingProgress: {
    currentPosition: number;
    isCompleted: boolean;
    lastReadDate?: string;
  };
  categories: string[];
}

interface RecentlyReadWidgetProps {
  pluginAPI?: any;
  config?: {
    limit?: number;
  };
}

const RecentlyReadWidget: React.FC<RecentlyReadWidgetProps> = ({ 
  pluginAPI, 
  config = { limit: 5 } 
}) => {
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentBooks();
  }, []);

  const loadRecentBooks = async () => {
    try {
      setLoading(true);
      
      // Get reading-core API if available
      if (pluginAPI?.getPluginAPI) {
        const readingAPI = pluginAPI.getPluginAPI('reading-core');
        if (readingAPI) {
          const allBooks = await readingAPI.library.getAllBooks();
          
          // Sort by last read date and filter recent ones
          const recent = allBooks
            .filter(book => book.readingProgress.lastReadDate || book.readingProgress.currentPosition > 0)
            .sort((a, b) => {
              const aDate = new Date(a.readingProgress.lastReadDate || a.lastModified);
              const bDate = new Date(b.readingProgress.lastReadDate || b.lastModified);
              return bDate.getTime() - aDate.getTime();
            })
            .slice(0, config.limit || 5);
          
          setRecentBooks(recent);
        }
      } else {
        // Fallback mock data for development
        setRecentBooks([
          {
            id: '1',
            title: 'Clean Code',
            author: 'Robert Martin',
            categories: ['Technical'],
            readingProgress: { 
              currentPosition: 0.45, 
              isCompleted: false,
              lastReadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            }
          },
          {
            id: '2',
            title: 'The Pragmatic Programmer',
            author: 'Hunt & Thomas',
            categories: ['Technical'],
            readingProgress: { 
              currentPosition: 1.0, 
              isCompleted: true,
              lastReadDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load recent books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeReading = (book: RecentBook) => {
    if (pluginAPI?.navigate) {
      pluginAPI.navigate(`/reader/book/${book.id}`);
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Recently';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px'
      }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <Clock size={24} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '12px' }}>Loading recent books...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '8px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#1F2937',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🕒 Recently Read
        </h3>
        
        {recentBooks.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: '#6B7280'
          }}>
            <TrendingUp size={12} />
            Active
          </div>
        )}
      </div>

      {/* Recent Books List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {recentBooks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#6B7280'
          }}>
            <BookOpen size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              No recent reading activity
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>
              Start reading to see your progress here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                onClick={() => handleResumeReading(book)}
              >
                {/* Book Cover/Icon */}
                <div style={{
                  width: '32px',
                  height: '40px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  flexShrink: 0,
                  backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {!book.coverUrl && <BookOpen size={14} color="#9CA3AF" />}
                </div>

                {/* Book Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#1F2937',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.title}
                  </div>
                  
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#6B7280',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.author}
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '1px',
                    overflow: 'hidden',
                    marginBottom: '3px'
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

                  {/* Progress Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '8px', color: '#6B7280' }}>
                      {book.readingProgress.isCompleted 
                        ? '✓ Complete' 
                        : `${Math.round(book.readingProgress.currentPosition * 100)}%`
                      }
                    </span>
                    <span style={{ fontSize: '8px', color: '#9CA3AF' }}>
                      {formatTimeAgo(book.readingProgress.lastReadDate)}
                    </span>
                  </div>
                </div>

                {/* Resume Button */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: book.readingProgress.isCompleted ? '#F0FDF4' : '#EBF8FF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '8px',
                  flexShrink: 0
                }}>
                  {book.readingProgress.isCompleted ? (
                    <BookOpen size={12} color="#16A34A" />
                  ) : (
                    <Play size={10} color="#3B82F6" fill="#3B82F6" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentBooks.length > 0 && (
        <div style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <button
            onClick={() => pluginAPI?.navigate?.('/reader/library')}
            style={{
              padding: '4px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            View Library →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentlyReadWidget;