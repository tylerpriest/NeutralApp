/**
 * Reading Interface - Beautiful, Uncluttered Design
 * Best practice implementation focused on reading experience
 * 
 * TODO: Modernize this component to use Tailwind classes instead of inline styles
 * - Replace all inline styles with Tailwind utility classes
 * - Improve responsive design with proper breakpoints
 * - Add modern UI patterns and better visual hierarchy
 * - Ensure accessibility compliance
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Bookmark, 
  Menu, 
  Sun, 
  Moon, 
  Type, 
  Maximize2, 
  Minimize2,
  BookOpen
} from 'lucide-react';
import { demoBookService, DemoBook } from '../services/DemoBookService';

interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  readingProgress: {
    currentPosition: number;
    currentChapter?: number;
    bookmarks: Bookmark[];
  };
}

interface Bookmark {
  id: string;
  position: number;
  text?: string;
  note?: string;
}

interface ReadingSettings {
  fontSize: number; // 14-24px
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  lineHeight: number; // 1.4-2.0
  theme: 'light' | 'dark' | 'sepia';
  columnWidth: number; // 600-900px
  wordSpacing: number; // 0-4px
}

interface ReadingInterfaceProps {
  bookId: string;
  pluginAPI?: any;
  onClose?: () => void;
}

const ReadingInterface: React.FC<ReadingInterfaceProps> = ({ bookId, pluginAPI, onClose }) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: 18,
    fontFamily: 'serif',
    lineHeight: 1.6,
    theme: 'light',
    columnWidth: 700,
    wordSpacing: 0
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    loadBook();
    loadReadingSettings();
  }, [bookId]);

  useEffect(() => {
    // Auto-hide controls after inactivity
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      setShowControls(true);
      resetTimeout();
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const loadBook = async () => {
    try {
      setLoading(true);
      
      // Try to load from demo book service first
      const demoBook = await demoBookService.getBook(bookId);
      if (demoBook) {
        setBook(demoBook);
        setLoading(false);
        return;
      }

      // Fallback to plugin API if demo book not found
      if (pluginAPI) {
        try {
          const readingAPI = pluginAPI.getPluginAPI('reading-core');
          if (readingAPI) {
            const bookData = await readingAPI.library.getBook(bookId);
            if (bookData) {
              setBook(bookData);
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Failed to load book from plugin API:', error);
        }
      }

      // Final fallback to mock data
      const mockBook: Book = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        content: 'This is the content of the test book. It contains multiple paragraphs and sentences for testing the reading interface.',
        readingProgress: {
          currentPosition: 0.25,
          currentChapter: 1,
          bookmarks: []
        }
      };
      
      setBook(mockBook);
    } catch (error) {
      console.error('Failed to load book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReadingSettings = () => {
    try {
      const saved = localStorage.getItem('reading-settings');
      if (saved) {
        setSettings({ ...settings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.warn('Failed to load reading settings:', error);
    }
  };

  const saveReadingSettings = (newSettings: ReadingSettings) => {
    try {
      localStorage.setItem('reading-settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.warn('Failed to save reading settings:', error);
    }
  };

  const handleSettingChange = (key: keyof ReadingSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveReadingSettings(newSettings);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const addBookmark = async () => {
    if (!book) return;
    
    try {
      // Try demo book service first
      await demoBookService.addBookmark(book.id, {
        position: book.readingProgress.currentPosition,
        text: 'Bookmarked section',
        note: ''
      });
      
      // Also try plugin API if available
      if (pluginAPI) {
        const readingAPI = pluginAPI.getPluginAPI('reading-core');
        if (readingAPI) {
          await readingAPI.library.addBookmark(book.id, {
            position: book.readingProgress.currentPosition,
            text: 'Bookmarked section',
            note: ''
          });
        }
      }
      
      // Reload book to get updated bookmarks
      loadBook();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-800 flex items-center justify-center z-50">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <BookOpen size={48} className="mb-4 opacity-50 mx-auto" />
          <div className="text-lg mb-2">Loading book...</div>
          <div className="text-sm opacity-70">Preparing your reading experience</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-800 flex items-center justify-center z-50">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <div className="text-lg mb-4">Book not found</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${
      settings.theme === 'dark' ? 'bg-gray-800 text-gray-100' :
      settings.theme === 'sepia' ? 'bg-amber-50 text-amber-900' :
      'bg-white text-gray-900'
    }`}>
      {/* Top Controls Bar */}
      <div
        className={`fixed top-0 left-0 right-0 h-15 flex items-center justify-between px-5 transition-all duration-300 z-10 backdrop-blur-md ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        } ${
          settings.theme === 'dark' ? 'bg-gray-800/90' :
          settings.theme === 'sepia' ? 'bg-amber-50/90' :
          'bg-white/90'
        }`}
      >
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            aria-label="Close reading interface"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              settings.theme === 'dark' ? 'border-gray-600 text-gray-100 hover:bg-gray-700' :
              settings.theme === 'sepia' ? 'border-amber-300 text-amber-900 hover:bg-amber-100' :
              'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={16} />
            Library
          </button>
          
          <div>
            <div className="text-base font-semibold">{book.title}</div>
            <div className="text-xs opacity-70">{book.author}</div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="text-xs opacity-70">
              {Math.round(book.readingProgress.currentPosition * 100)}%
            </div>
            <div className={`w-24 h-1 rounded-full ${
              settings.theme === 'dark' ? 'bg-gray-600' :
              settings.theme === 'sepia' ? 'bg-amber-300' :
              'bg-gray-300'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  settings.theme === 'dark' ? 'bg-gray-100' :
                  settings.theme === 'sepia' ? 'bg-amber-600' :
                  'bg-blue-500'
                }`}
                style={{ width: `${book.readingProgress.currentPosition * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={addBookmark}
            aria-label="Add bookmark"
            className={`p-2 rounded-md transition-colors hover:bg-opacity-20 ${
              settings.theme === 'dark' ? 'hover:bg-gray-600' :
              settings.theme === 'sepia' ? 'hover:bg-amber-200' :
              'hover:bg-gray-200'
            }`}
          >
            <Bookmark size={18} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Reading settings"
            className={`p-2 rounded-md transition-colors ${
              showSettings ? 
                (settings.theme === 'dark' ? 'bg-gray-600 text-gray-100' : 
                 settings.theme === 'sepia' ? 'bg-amber-200 text-amber-900' : 
                 'bg-gray-200 text-gray-900') :
              (settings.theme === 'dark' ? 'hover:bg-gray-600 text-gray-100' : 
               settings.theme === 'sepia' ? 'hover:bg-amber-200 text-amber-900' : 
               'hover:bg-gray-200 text-gray-900')
            }`}
          >
            <Settings size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className={`p-2 rounded-md transition-colors ${
              settings.theme === 'dark' ? 'hover:bg-gray-600 text-gray-100' :
              settings.theme === 'sepia' ? 'hover:bg-amber-200 text-amber-900' :
              'hover:bg-gray-200 text-gray-900'
            }`}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className={`fixed top-15 right-5 w-80 p-5 rounded-lg border shadow-lg z-20 ${
            settings.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' :
            settings.theme === 'sepia' ? 'bg-amber-100 border-amber-300 text-amber-900' :
            'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <h3 className="mb-4 text-base font-semibold">
            Reading Settings
          </h3>

          {/* Font Size */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block">
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
              className={`w-full p-2 rounded-md border transition-colors ${
                settings.theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-100' :
                settings.theme === 'sepia' ? 'border-amber-300 bg-amber-50 text-amber-900' :
                'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>

          {/* Line Height */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block">
              Line Height: {settings.lineHeight}
            </label>
            <input
              type="range"
              min="1.4"
              max="2.0"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Column Width */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block">
              Column Width: {settings.columnWidth}px
            </label>
            <input
              type="range"
              min="600"
              max="900"
              step="50"
              value={settings.columnWidth}
              onChange={(e) => handleSettingChange('columnWidth', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Theme */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block">
              Theme
            </label>
            <div className="flex gap-2">
              {[
                { key: 'light', icon: Sun, label: 'Light' },
                { key: 'dark', icon: Moon, label: 'Dark' },
                { key: 'sepia', icon: BookOpen, label: 'Sepia' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleSettingChange('theme', key)}
                  className={`flex-1 p-2 rounded-md border transition-colors flex flex-col items-center gap-1 text-xs ${
                    settings.theme === key ? 
                      (settings.theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 
                       settings.theme === 'sepia' ? 'bg-amber-200 border-amber-400 text-amber-900' : 
                       'bg-gray-200 border-gray-400 text-gray-900') :
                      (settings.theme === 'dark' ? 'border-gray-600 text-gray-100 hover:bg-gray-600' : 
                       settings.theme === 'sepia' ? 'border-amber-300 text-amber-900 hover:bg-amber-200' : 
                       'border-gray-300 text-gray-900 hover:bg-gray-200')
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading Content */}
      <div
        ref={contentRef}
        className="pt-15 px-8 pb-8 h-full overflow-auto flex justify-center"
      >
        <div
          className="max-w-none mx-auto"
          style={{
            maxWidth: `${settings.columnWidth}px`,
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily === 'serif' ? 'Georgia, serif' : 
                        settings.fontFamily === 'sans-serif' ? 'system-ui, sans-serif' : 
                        'Consolas, monospace',
            lineHeight: settings.lineHeight,
            wordSpacing: `${settings.wordSpacing}px`,
          }}
          dangerouslySetInnerHTML={{ __html: book.content }}
        />
      </div>
    </div>
  );
};

export default ReadingInterface;