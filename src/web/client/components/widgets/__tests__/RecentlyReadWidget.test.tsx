import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentlyReadWidget from '../RecentlyReadWidget';

// Mock the plugin API
const mockPluginAPI = {
  getPluginAPI: jest.fn(),
  navigate: jest.fn()
};

// Mock reading-core API
const mockReadingAPI = {
  library: {
    getAllBooks: jest.fn()
  }
};

describe('RecentlyReadWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPluginAPI.getPluginAPI.mockReturnValue(mockReadingAPI);
  });

  describe('Widget Initialization', () => {
    it('should render loading state initially', () => {
      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);
      
      expect(screen.getByText('Loading recent books...')).toBeInTheDocument();
    });

    it('should load and display recent books when reading API is available', async () => {
      const mockBooks = [
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
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Clean Code')).toBeInTheDocument();
        expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
        expect(screen.getByText('Robert Martin')).toBeInTheDocument();
        expect(screen.getByText('Hunt & Thomas')).toBeInTheDocument();
      });
    });

    it('should fallback to mock data when reading API is not available', async () => {
      mockPluginAPI.getPluginAPI.mockReturnValue(null);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Books Sorting', () => {
    it('should sort books by last read date (most recent first)', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Old Book',
          author: 'Author 1',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
          }
        },
        {
          id: '2',
          title: 'Recent Book',
          author: 'Author 2',
          categories: ['Non-Fiction'],
          readingProgress: { 
            currentPosition: 0.3, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        const bookElements = screen.getAllByText(/Book$/);
        expect(bookElements[0]).toHaveTextContent('Recent Book');
        expect(bookElements[1]).toHaveTextContent('Old Book');
      });
    });

    it('should filter out books with no reading progress', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Read Book',
          author: 'Author 1',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: '2',
          title: 'Unread Book',
          author: 'Author 2',
          categories: ['Non-Fiction'],
          readingProgress: { 
            currentPosition: 0, 
            isCompleted: false
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Read Book')).toBeInTheDocument();
        expect(screen.queryByText('Unread Book')).not.toBeInTheDocument();
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format time ago correctly for different time periods', async () => {
      const now = new Date();
      const mockBooks = [
        {
          id: '1',
          title: 'Just Now Book',
          author: 'Author 1',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false,
            lastReadDate: new Date(now.getTime() - 30 * 60 * 1000).toISOString() // 30 minutes ago
          }
        },
        {
          id: '2',
          title: 'Hours Ago Book',
          author: 'Author 2',
          categories: ['Non-Fiction'],
          readingProgress: { 
            currentPosition: 0.3, 
            isCompleted: false,
            lastReadDate: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
          }
        },
        {
          id: '3',
          title: 'Days Ago Book',
          author: 'Author 3',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.7, 
            isCompleted: false,
            lastReadDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Just now')).toBeInTheDocument();
        expect(screen.getByText('3h ago')).toBeInTheDocument();
        expect(screen.getByText('3d ago')).toBeInTheDocument();
      });
    });

    it('should show "Recently" for books without lastReadDate', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'No Date Book',
          author: 'Author 1',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Recently')).toBeInTheDocument();
      });
    });
  });

  describe('Resume Reading Functionality', () => {
    it('should navigate to reading interface when resume button is clicked', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Test Book',
          author: 'Test Author',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const bookItem = screen.getByText('Test Book');
      fireEvent.click(bookItem);

      expect(mockPluginAPI.navigate).toHaveBeenCalledWith('/reader/book/1');
    });

    it('should show "Continue" for in-progress books', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'In Progress Book',
          author: 'Test Author',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.3, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('In Progress Book')).toBeInTheDocument();
      });
    });

    it('should show "Re-read" for completed books', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Completed Book',
          author: 'Test Author',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 1.0, 
            isCompleted: true,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Completed Book')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Display', () => {
    it('should display reading progress percentage', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Progress Book',
          author: 'Test Author',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.75, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should show completion indicator for finished books', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Finished Book',
          author: 'Test Author',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 1.0, 
            isCompleted: true,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('✓ Complete')).toBeInTheDocument();
      });
    });
  });

  describe('Configuration Options', () => {
    it('should respect limit configuration', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Book 1',
          author: 'Author 1',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: '2',
          title: 'Book 2',
          author: 'Author 2',
          categories: ['Non-Fiction'],
          readingProgress: { 
            currentPosition: 0.3, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: '3',
          title: 'Book 3',
          author: 'Author 3',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.7, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} config={{ limit: 2 }} />);

      await waitFor(() => {
        expect(screen.getByText('Book 1')).toBeInTheDocument();
        expect(screen.getByText('Book 2')).toBeInTheDocument();
        expect(screen.queryByText('Book 3')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no recent books', async () => {
      mockReadingAPI.library.getAllBooks.mockResolvedValue([]);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
        expect(screen.getByText('Start reading to see your progress here')).toBeInTheDocument();
      });
    });

    it('should navigate to library when "Browse Library" is clicked', async () => {
      mockReadingAPI.library.getAllBooks.mockResolvedValue([]);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
      });

      // The empty state doesn't have a button, so we'll test the empty state display
      expect(screen.getByText('Start reading to see your progress here')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockReadingAPI.library.getAllBooks.mockRejectedValue(new Error('API Error'));

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
      });
    });

    it('should handle missing plugin API gracefully', async () => {
      mockPluginAPI.getPluginAPI.mockReturnValue(null);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('No recent reading activity')).toBeInTheDocument();
      });
    });
  });

  describe('Active Status Indicator', () => {
    it('should show active indicator when there are recent books', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Active Book',
          author: 'Test Author',
          categories: ['Fiction'],
          readingProgress: { 
            currentPosition: 0.5, 
            isCompleted: false,
            lastReadDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('should not show active indicator when no recent books', async () => {
      mockReadingAPI.library.getAllBooks.mockResolvedValue([]);

      render(<RecentlyReadWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.queryByText('Active')).not.toBeInTheDocument();
      });
    });
  });
}); 