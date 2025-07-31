import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Volume2,
  Maximize,
  Minimize,
  Type,
  Moon,
  Sun,
  Plus,
  Minus
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  progress: {
    currentPage: number;
    totalPages: number;
    percentage: number;
    lastRead: string | null;
  };
  settings: {
    fontSize: number;
    lineSpacing: number;
    theme: 'light' | 'dark' | 'sepia';
    fontFamily: string;
  };
}

interface BookReaderProps {
  book: Book;
  onProgressUpdate: (progress: { currentPage: number; percentage: number }) => void;
  onBookmarkAdd: (bookmark: { position: number; text: string; note?: string }) => void;
  onNoteAdd: (note: { position: number; text: string; selectedText?: string }) => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  book,
  onProgressUpdate,
  onBookmarkAdd,
  onNoteAdd
}) => {
  const [currentPage, setCurrentPage] = useState(book.progress.currentPage);
  const [isReading, setIsReading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [readingMode, setReadingMode] = useState<'continuous' | 'paginated'>('continuous');
  const [fontSize, setFontSize] = useState(book.settings.fontSize);
  const [lineSpacing, setLineSpacing] = useState(book.settings.lineSpacing);
  const [theme, setTheme] = useState(book.settings.theme);
  const [fontFamily, setFontFamily] = useState(book.settings.fontFamily);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total pages based on content
  const totalPages = Math.ceil(book.content.length / 2000); // Rough estimate
  const currentPercentage = (currentPage / totalPages) * 100;

  useEffect(() => {
    // Auto-save progress every 30 seconds
    progressIntervalRef.current = setInterval(() => {
      if (isReading) {
        onProgressUpdate({
          currentPage,
          percentage: currentPercentage
        });
      }
    }, 30000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentPage, isReading, onProgressUpdate, currentPercentage]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, totalPages)
      : Math.max(currentPage - 1, 1);
    
    setCurrentPage(newPage);
    
    // Update progress
    onProgressUpdate({
      currentPage: newPage,
      percentage: (newPage / totalPages) * 100
    });
  };

  const handleReadingToggle = () => {
    setIsReading(!isReading);
  };

  const handleBookmarkAdd = () => {
    const selectedText = window.getSelection()?.toString() || '';
    onBookmarkAdd({
      position: currentPercentage,
      text: selectedText || `Page ${currentPage}`,
      note: selectedText ? undefined : `Bookmark at page ${currentPage}`
    });
  };

  const handleNoteAdd = () => {
    const selectedText = window.getSelection()?.toString() || '';
    onNoteAdd({
      position: currentPercentage,
      text: `Note at page ${currentPage}`,
      selectedText: selectedText || undefined
    });
  };

  const handleFontSizeChange = (direction: 'increase' | 'decrease') => {
    const newSize = direction === 'increase' 
      ? Math.min(fontSize + 2, 24)
      : Math.max(fontSize - 2, 12);
    setFontSize(newSize);
  };

  const handleThemeChange = () => {
    const themes: ('light' | 'dark' | 'sepia')[] = ['light', 'dark', 'sepia'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-gray-900 text-gray-100',
          content: 'bg-gray-800',
          controls: 'bg-gray-700'
        };
      case 'sepia':
        return {
          background: 'bg-amber-50 text-amber-900',
          content: 'bg-amber-100',
          controls: 'bg-amber-200'
        };
      default:
        return {
          background: 'bg-white text-gray-900',
          content: 'bg-gray-50',
          controls: 'bg-gray-100'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`min-h-screen ${themeStyles.background} transition-colors duration-300`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 ${themeStyles.controls} border-b border-gray-300 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">{book.title}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmarkAdd}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Add Bookmark"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNoteAdd}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Add Note"
            >
              <Type className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleReadingToggle}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title={isReading ? 'Pause Reading' : 'Start Reading'}
            >
              {isReading ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Reading Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{Math.round(currentPercentage)}% complete</span>
            <span>{book.progress.lastRead ? `Last read: ${new Date(book.progress.lastRead).toLocaleDateString()}` : 'Not started'}</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`${themeStyles.controls} border-b border-gray-300 p-4`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Font Size:</span>
                <button
                  onClick={() => handleFontSizeChange('decrease')}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium w-8 text-center">{fontSize}px</span>
                <button
                  onClick={() => handleFontSizeChange('increase')}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Theme:</span>
                <button
                  onClick={handleThemeChange}
                  className="p-2 rounded hover:bg-gray-200"
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : 
                   theme === 'sepia' ? <BookOpen className="w-4 h-4" /> : 
                   <Sun className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Mode:</span>
                <select
                  value={readingMode}
                  onChange={(e) => setReadingMode(e.target.value as 'continuous' | 'paginated')}
                  className="text-sm bg-transparent border border-gray-300 rounded px-2 py-1"
                >
                  <option value="continuous">Continuous</option>
                  <option value="paginated">Paginated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div
          ref={contentRef}
          className={`${themeStyles.content} rounded-lg p-8 shadow-lg`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineSpacing,
            fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 
                        fontFamily === 'mono' ? 'Courier New, monospace' : 
                        'system-ui, sans-serif'
          }}
        >
          <h1 className="text-3xl font-bold mb-6">{book.title}</h1>
          <h2 className="text-xl text-gray-600 mb-8">by {book.author}</h2>
          
          <div className="prose prose-lg max-w-none">
            {readingMode === 'paginated' ? (
              // Paginated mode - show current page content
              <div className="space-y-4">
                {book.content
                  .split('\n\n')
                  .slice((currentPage - 1) * 3, currentPage * 3)
                  .map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : (
              // Continuous mode - show all content with scroll
              <div className="space-y-4">
                {book.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reading Controls (Bottom) */}
      <div className={`fixed bottom-0 left-0 right-0 ${themeStyles.controls} border-t border-gray-300 p-4`}>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage <= 1}
            className="p-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleReadingToggle}
            className="p-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isReading ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage >= totalPages}
            className="p-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookReader; 