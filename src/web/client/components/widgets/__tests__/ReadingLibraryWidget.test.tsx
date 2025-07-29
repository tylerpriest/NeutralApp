import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingLibraryWidget from '../ReadingLibraryWidget';

// Mock the plugin API
const mockPluginAPI = {
  getPluginAPI: jest.fn(),
  navigate: jest.fn()
};

// Mock reading-core API
const mockReadingAPI = {
  library: {
    getAllBooks: jest.fn(),
    getLibraryStats: jest.fn()
  }
};

describe('ReadingLibraryWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPluginAPI.getPluginAPI.mockReturnValue(mockReadingAPI);
  });

  describe('Widget Initialization', () => {
    it('should render loading state initially', () => {
      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);
      
      expect(screen.getByText('Loading library...')).toBeInTheDocument();
    });

    it('should load and display library data when reading API is available', async () => {
      const mockBooks = [
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
      ];

      const mockStats = {
        totalBooks: 12,
        completedBooks: 8,
        inProgressBooks: 3,
        totalReadingTime: 240
      };

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue(mockStats);

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('The Art of Programming')).toBeInTheDocument();
        expect(screen.getByText('Design Patterns')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument(); // Total books
        expect(screen.getByText('8')).toBeInTheDocument(); // Completed books
        expect(screen.getByText('3')).toBeInTheDocument(); // In progress books
      });
    });

    it('should fallback to mock data when reading API is not available', async () => {
      mockPluginAPI.getPluginAPI.mockReturnValue(null);

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('No books in library')).toBeInTheDocument();
      });
    });
  });

  describe('Library Statistics Display', () => {
    it('should display all library statistics correctly', async () => {
      const mockStats = {
        totalBooks: 25,
        completedBooks: 15,
        inProgressBooks: 8,
        totalReadingTime: 480
      };

      mockReadingAPI.library.getAllBooks.mockResolvedValue([]);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue(mockStats);

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Total books
        expect(screen.getByText('15')).toBeInTheDocument(); // Completed books
        expect(screen.getByText('8')).toBeInTheDocument(); // In progress books
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter books by search term', async () => {
      const mockBooks = [
        { id: '1', title: 'JavaScript Guide', author: 'John Doe', categories: ['Technical'], readingProgress: { currentPosition: 0.5, isCompleted: false } },
        { id: '2', title: 'Python Basics', author: 'Jane Smith', categories: ['Technical'], readingProgress: { currentPosition: 0.3, isCompleted: false } }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 2, completedBooks: 0, inProgressBooks: 2, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript Guide')).toBeInTheDocument();
        expect(screen.getByText('Python Basics')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search books...');
      fireEvent.change(searchInput, { target: { value: 'JavaScript' } });

      expect(screen.getByText('JavaScript Guide')).toBeInTheDocument();
      expect(screen.queryByText('Python Basics')).not.toBeInTheDocument();
    });

    it('should search by author name', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', author: 'John Doe', categories: ['Fiction'], readingProgress: { currentPosition: 0.5, isCompleted: false } },
        { id: '2', title: 'Book 2', author: 'Jane Smith', categories: ['Non-Fiction'], readingProgress: { currentPosition: 0.3, isCompleted: false } }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 2, completedBooks: 0, inProgressBooks: 2, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search books...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to reading interface when book is clicked', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author', categories: ['Fiction'], readingProgress: { currentPosition: 0.5, isCompleted: false } }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 1, completedBooks: 0, inProgressBooks: 1, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Book'));

      expect(mockPluginAPI.navigate).toHaveBeenCalledWith('/reader/book/1');
    });

    it('should navigate to import page when Add Book is clicked', async () => {
      mockReadingAPI.library.getAllBooks.mockResolvedValue([]);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 0, completedBooks: 0, inProgressBooks: 0, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Add Book')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Book'));

      expect(mockPluginAPI.navigate).toHaveBeenCalledWith('/reader/import');
    });

    it('should navigate to library page when View All is clicked', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author', categories: ['Fiction'], readingProgress: { currentPosition: 0.5, isCompleted: false } }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 1, completedBooks: 0, inProgressBooks: 1, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('View All Books →')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('View All Books →'));

      expect(mockPluginAPI.navigate).toHaveBeenCalledWith('/reader/library');
    });
  });

  describe('Configuration Options', () => {
    it('should respect limit configuration', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', author: 'Author 1', categories: ['Fiction'], readingProgress: { currentPosition: 0.5, isCompleted: false } },
        { id: '2', title: 'Book 2', author: 'Author 2', categories: ['Fiction'], readingProgress: { currentPosition: 0.5, isCompleted: false } },
        { id: '3', title: 'Book 3', author: 'Author 3', categories: ['Fiction'], readingProgress: { currentPosition: 0.5, isCompleted: false } }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 3, completedBooks: 0, inProgressBooks: 3, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} config={{ limit: 2 }} />);

      await waitFor(() => {
        expect(screen.getByText('Book 1')).toBeInTheDocument();
        expect(screen.getByText('Book 2')).toBeInTheDocument();
        expect(screen.queryByText('Book 3')).not.toBeInTheDocument();
      });
    });

    it('should hide search when showSearch is false', async () => {
      mockReadingAPI.library.getAllBooks.mockResolvedValue([]);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 0, completedBooks: 0, inProgressBooks: 0, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} config={{ showSearch: false }} />);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search books...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockReadingAPI.library.getAllBooks.mockRejectedValue(new Error('API Error'));
      mockReadingAPI.library.getLibraryStats.mockRejectedValue(new Error('API Error'));

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('No books in library')).toBeInTheDocument();
      });
    });

    it('should handle missing plugin API gracefully', async () => {
      mockPluginAPI.getPluginAPI.mockReturnValue(null);

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('No books in library')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Display', () => {
    it('should display reading progress for books', async () => {
      const mockBooks = [
        { 
          id: '1', 
          title: 'Test Book', 
          author: 'Test Author', 
          categories: ['Fiction'], 
          readingProgress: { currentPosition: 0.75, isCompleted: false } 
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 1, completedBooks: 0, inProgressBooks: 1, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
        // Progress should be displayed (75%)
        expect(screen.getByText(/75%/)).toBeInTheDocument();
      });
    });

    it('should show completion status for finished books', async () => {
      const mockBooks = [
        { 
          id: '1', 
          title: 'Completed Book', 
          author: 'Test Author', 
          categories: ['Fiction'], 
          readingProgress: { currentPosition: 1.0, isCompleted: true } 
        }
      ];

      mockReadingAPI.library.getAllBooks.mockResolvedValue(mockBooks);
      mockReadingAPI.library.getLibraryStats.mockResolvedValue({ totalBooks: 1, completedBooks: 1, inProgressBooks: 0, totalReadingTime: 0 });

      render(<ReadingLibraryWidget pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Completed Book')).toBeInTheDocument();
        // Should show completion indicator
        expect(screen.getByText(/100%/)).toBeInTheDocument();
      });
    });
  });
}); 