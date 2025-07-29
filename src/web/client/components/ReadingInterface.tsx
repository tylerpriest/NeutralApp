/**
 * Reading Interface - Beautiful, Uncluttered Design
 * Best practice implementation focused on reading experience
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
      
      if (pluginAPI?.getPluginAPI) {
        const readingAPI = pluginAPI.getPluginAPI('reading-core');
        if (readingAPI) {
          const bookData = await readingAPI.library.getBook(bookId);
          if (bookData) {
            setBook(bookData);
          }
        }
      } else {
        // Mock data for development
        setBook({
          id: bookId,
          title: 'Sample Book',
          author: 'Author Name',
          content: `
            <h1>Chapter 1: The Beginning</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            
            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
          `,
          readingProgress: {
            currentPosition: 0.25,
            currentChapter: 1,
            bookmarks: []
          }
        });
      }
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
    if (!book || !pluginAPI?.getPluginAPI) return;
    
    try {
      const readingAPI = pluginAPI.getPluginAPI('reading-core');
      if (readingAPI) {
        await readingAPI.library.addBookmark(book.id, {
          position: book.readingProgress.currentPosition,
          text: 'Bookmarked section',
          note: ''
        });
        // Reload book to get updated bookmarks
        loadBook();
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  const getThemeStyles = () => {
    switch (settings.theme) {
      case 'dark':
        return {
          backgroundColor: '#1F2937',
          color: '#F9FAFB',
          controlsBg: 'rgba(31, 41, 55, 0.9)',
          settingsBg: '#374151'
        };
      case 'sepia':
        return {
          backgroundColor: '#FEF7E0',
          color: '#78350F',
          controlsBg: 'rgba(254, 247, 224, 0.9)',
          settingsBg: '#FED7AA'
        };
      default: // light
        return {
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          controlsBg: 'rgba(255, 255, 255, 0.9)',
          settingsBg: '#F9FAFB'
        };
    }
  };

  const themeStyles = getThemeStyles();

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: themeStyles.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center', color: themeStyles.color }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading book...</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>Preparing your reading experience</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: themeStyles.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center', color: themeStyles.color }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>Book not found</div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: themeStyles.backgroundColor,
      color: themeStyles.color,
      zIndex: 9999,
      transition: 'all 0.3s ease'
    }}>
      {/* Top Controls Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: themeStyles.controlsBg,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
      >
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${themeStyles.color}20`,
              borderRadius: '6px',
              color: themeStyles.color,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <ChevronLeft size={16} />
            Library
          </button>
          
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{book.title}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{book.author}</div>
          </div>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {Math.round(book.readingProgress.currentPosition * 100)}%
            </div>
            <div style={{
              width: '100px',
              height: '3px',
              backgroundColor: `${themeStyles.color}20`,
              borderRadius: '2px'
            }}>
              <div
                style={{
                  width: `${book.readingProgress.currentPosition * 100}%`,
                  height: '100%',
                  backgroundColor: themeStyles.color,
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={addBookmark}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: themeStyles.color,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            <Bookmark size={18} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '8px',
              backgroundColor: showSettings ? `${themeStyles.color}20` : 'transparent',
              border: 'none',
              color: themeStyles.color,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            <Settings size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: themeStyles.color,
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: '20px',
            width: '300px',
            backgroundColor: themeStyles.settingsBg,
            border: `1px solid ${themeStyles.color}20`,
            borderRadius: '8px',
            padding: '20px',
            zIndex: 10,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
            Reading Settings
          </h3>

          {/* Font Size */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Font Family */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: `1px solid ${themeStyles.color}20`,
                backgroundColor: themeStyles.backgroundColor,
                color: themeStyles.color
              }}
            >
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>

          {/* Line Height */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Line Height: {settings.lineHeight}
            </label>
            <input
              type="range"
              min="1.4"
              max="2.0"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Column Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Column Width: {settings.columnWidth}px
            </label>
            <input
              type="range"
              min="600"
              max="900"
              value={settings.columnWidth}
              onChange={(e) => handleSettingChange('columnWidth', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Theme */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Theme
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'light', icon: Sun, label: 'Light' },
                { key: 'dark', icon: Moon, label: 'Dark' },
                { key: 'sepia', icon: BookOpen, label: 'Sepia' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleSettingChange('theme', key)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: settings.theme === key ? `${themeStyles.color}20` : 'transparent',
                    border: `1px solid ${themeStyles.color}20`,
                    borderRadius: '4px',
                    color: themeStyles.color,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px'
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Content */}
      <div
        ref={contentRef}
        style={{
          padding: '80px 40px 40px 40px',
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
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