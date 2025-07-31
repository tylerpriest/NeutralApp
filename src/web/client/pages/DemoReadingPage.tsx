/**
 * Demo Reading Page - Test the ReadingInterface with uploaded books
 * 
 * TODO: Test the demo reading interface with the uploaded books
 * - Navigate to /demo-reading to test the interface
 * - Verify both books load correctly (markdown and EPUB)
 * - Test all reading features (settings, bookmarks, fullscreen)
 * - Verify reading progress is saved
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReadingInterface from '../components/ReadingInterface';
import { demoBookService } from '../services/DemoBookService';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';

const DemoReadingPage: React.FC = () => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadDemoBooks();
  }, []);

  const loadDemoBooks = async () => {
    try {
      const demoBooks = await demoBookService.getAllBooks();
      setBooks(demoBooks);
    } catch (error) {
      console.error('Failed to load demo books:', error);
    }
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleClose = () => {
    setSelectedBookId(null);
  };

  if (selectedBookId) {
    return (
      <ReadingInterface 
        bookId={selectedBookId} 
        onClose={handleClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Reading Interface</h1>
          <p className="text-gray-600">Test the reading interface with uploaded books</p>
        </div>

        {/* Book Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleBookSelect(book.id)}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText size={16} />
                    <span>Progress: {Math.round(book.readingProgress.currentPosition * 100)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${book.readingProgress.currentPosition * 100}%` }}
                    />
                  </div>
                  
                  <button
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to Test</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Click on any book to open it in the reading interface</li>
            <li>• Use the settings panel to adjust font size, theme, and layout</li>
            <li>• Try the bookmark and fullscreen features</li>
            <li>• Test keyboard navigation (arrow keys)</li>
            <li>• The interface will remember your reading progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoReadingPage; 