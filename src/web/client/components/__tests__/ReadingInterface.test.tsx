import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingInterface from '../ReadingInterface';

// Mock the plugin API
const mockPluginAPI = {
  getPluginAPI: jest.fn(),
  navigate: jest.fn()
};

// Mock reading-core API
const mockReadingAPI = {
  library: {
    getBook: jest.fn(),
    updateReadingProgress: jest.fn(),
    addBookmark: jest.fn()
  }
};

describe('ReadingInterface', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    content: 'This is the content of the test book. It contains multiple paragraphs and sentences for testing the reading interface.',
    readingProgress: {
      currentPosition: 0.25,
      currentChapter: 1,
      bookmarks: []
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPluginAPI.getPluginAPI.mockReturnValue(mockReadingAPI);
    mockReadingAPI.library.getBook.mockResolvedValue(mockBook);
  });

  describe('Component Initialization', () => {
    it('should render loading state initially', () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);
      
      expect(screen.getByText('Loading book...')).toBeInTheDocument();
    });

    it('should load and display book content when API is available', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
        expect(screen.getByText('Test Author')).toBeInTheDocument();
        expect(screen.getByText(/This is the content of the test book/)).toBeInTheDocument();
      });
    });

    it('should fallback to mock data when reading API is not available', async () => {
      mockPluginAPI.getPluginAPI.mockReturnValue(null);

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Sample Book')).toBeInTheDocument();
        expect(screen.getByText('Sample Author')).toBeInTheDocument();
      });
    });
  });

  describe('Reading Controls', () => {
    it('should show controls on mouse movement', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Controls should be visible initially
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should hide controls after inactivity', async () => {
      jest.useFakeTimers();
      
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Fast-forward time to trigger auto-hide
      jest.advanceTimersByTime(3500);

      // Controls should be hidden
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it('should show controls again on mouse movement', async () => {
      jest.useFakeTimers();
      
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Fast-forward time to hide controls
      jest.advanceTimersByTime(3500);

      // Simulate mouse movement
      fireEvent.mouseMove(document);

      // Controls should be visible again
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Reading Settings', () => {
    it('should open settings panel when settings button is clicked', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);

      expect(screen.getByText('Reading Settings')).toBeInTheDocument();
      expect(screen.getByText('Font Size')).toBeInTheDocument();
      expect(screen.getByText('Font Family')).toBeInTheDocument();
      expect(screen.getByText('Line Height')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('should apply font size changes', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      // Change font size
      const fontSizeInput = screen.getByLabelText(/font size/i);
      fireEvent.change(fontSizeInput, { target: { value: '20' } });

      // Content should have updated font size
      const contentElement = screen.getByText(/This is the content/);
      expect(contentElement).toHaveStyle('font-size: 20px');
    });

    it('should apply theme changes', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      // Change theme to dark
      const themeSelect = screen.getByLabelText(/theme/i);
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      // Content should have dark theme
      const contentElement = screen.getByText(/This is the content/);
      expect(contentElement).toHaveStyle('background-color: #1a1a1a');
      expect(contentElement).toHaveStyle('color: #e5e7eb');
    });

    it('should save settings to localStorage', async () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      // Change font size
      const fontSizeInput = screen.getByLabelText(/font size/i);
      fireEvent.change(fontSizeInput, { target: { value: '22' } });

      // Settings should be saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'reading-settings',
        expect.stringContaining('"fontSize":22')
      );
    });
  });

  describe('Bookmark Functionality', () => {
    it('should add bookmark when bookmark button is clicked', async () => {
      mockReadingAPI.library.addBookmark.mockResolvedValue({
        id: 'bookmark-1',
        position: 0.25,
        dateCreated: new Date().toISOString()
      });

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      fireEvent.click(bookmarkButton);

      expect(mockReadingAPI.library.addBookmark).toHaveBeenCalledWith('1', {
        position: 0.25,
        text: expect.any(String)
      });

      // Should show success feedback
      expect(screen.getByText(/bookmark added/i)).toBeInTheDocument();
    });

    it('should display existing bookmarks', async () => {
      const bookWithBookmarks = {
        ...mockBook,
        readingProgress: {
          ...mockBook.readingProgress,
          bookmarks: [
            {
              id: 'bookmark-1',
              position: 0.25,
              text: 'Sample text',
              dateCreated: new Date().toISOString()
            }
          ]
        }
      };

      mockReadingAPI.library.getBook.mockResolvedValue(bookWithBookmarks);

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Should show bookmark indicator
      expect(screen.getByText('🔖')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('should update reading progress when scrolling', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Simulate scroll to update progress
      const contentElement = screen.getByText(/This is the content/);
      fireEvent.scroll(contentElement, { target: { scrollTop: 100 } });

      // Should update progress
      expect(mockReadingAPI.library.updateReadingProgress).toHaveBeenCalledWith('1', {
        currentPosition: expect.any(Number),
        lastReadDate: expect.any(String)
      });
    });

    it('should display current progress', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Should show progress indicator
      expect(screen.getByText(/25%/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to previous page when previous button is clicked', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);

      // Should update progress to previous position
      expect(mockReadingAPI.library.updateReadingProgress).toHaveBeenCalledWith('1', {
        currentPosition: expect.any(Number),
        lastReadDate: expect.any(String)
      });
    });

    it('should navigate to next page when next button is clicked', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should update progress to next position
      expect(mockReadingAPI.library.updateReadingProgress).toHaveBeenCalledWith('1', {
        currentPosition: expect.any(Number),
        lastReadDate: expect.any(String)
      });
    });
  });

  describe('Fullscreen Mode', () => {
    it('should toggle fullscreen mode', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);

      // Should enter fullscreen mode
      expect(screen.getByRole('button', { name: /exit fullscreen/i })).toBeInTheDocument();
    });

    it('should exit fullscreen mode', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Enter fullscreen
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      fireEvent.click(fullscreenButton);

      // Exit fullscreen
      const exitFullscreenButton = screen.getByRole('button', { name: /exit fullscreen/i });
      fireEvent.click(exitFullscreenButton);

      // Should exit fullscreen mode
      expect(screen.getByRole('button', { name: /fullscreen/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle book loading errors gracefully', async () => {
      mockReadingAPI.library.getBook.mockRejectedValue(new Error('Book not found'));

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('Sample Book')).toBeInTheDocument();
      });
    });

    it('should handle missing plugin API gracefully', async () => {
      mockPluginAPI.getPluginAPI.mockReturnValue(null);

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        // Should fallback to mock data
        expect(screen.getByText('Sample Book')).toBeInTheDocument();
      });
    });

    it('should handle bookmark creation errors', async () => {
      mockReadingAPI.library.addBookmark.mockRejectedValue(new Error('Failed to add bookmark'));

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      fireEvent.click(bookmarkButton);

      // Should show error message
      expect(screen.getByText(/failed to add bookmark/i)).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const mockOnClose = jest.fn();

      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should navigate back when no onClose is provided', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockPluginAPI.navigate).toHaveBeenCalledWith('/reader/library');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard shortcuts', async () => {
      render(<ReadingInterface bookId="1" pluginAPI={mockPluginAPI} />);

      await waitFor(() => {
        expect(screen.getByText('Test Book')).toBeInTheDocument();
      });

      // Test left arrow key
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(mockReadingAPI.library.updateReadingProgress).toHaveBeenCalled();

      // Test right arrow key
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(mockReadingAPI.library.updateReadingProgress).toHaveBeenCalled();

      // Test escape key to close
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockPluginAPI.navigate).toHaveBeenCalledWith('/reader/library');
    });
  });
}); 