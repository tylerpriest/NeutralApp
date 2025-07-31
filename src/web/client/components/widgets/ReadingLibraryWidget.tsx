/**
 * Reading Library Widget - Best Practice Implementation
 * Provides essential library overview with search and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Grid, List, BookOpen, Clock, Star } from 'lucide-react';

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
  };
  rating: number;
  tags: string[];
  categoryId?: string;
}

interface ReadingLibraryWidgetProps {
  data?: {
    books?: Book[];
    categories?: Array<{ id: string; name: string; color: string; icon: string }>;
  };
}

const ReadingLibraryWidget: React.FC<ReadingLibraryWidgetProps> = ({ data }) => {
  const [books, setBooks] = useState<Book[]>(data?.books || []);
  const [categories, setCategories] = useState(data?.categories || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'lastRead' | 'rating'>('title');

  useEffect(() => {
    if (data?.books) {
      setBooks(data.books);
    }
    if (data?.categories) {
      setCategories(data.categories);
    }
  }, [data]);

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'lastRead':
          return (b.progress.lastRead ? new Date(b.progress.lastRead).getTime() : 0) -
                 (a.progress.lastRead ? new Date(a.progress.lastRead).getTime() : 0);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return '#6B7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryIcon = (categoryId?: string) => {
    if (!categoryId) return '📚';
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📚';
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📚 Book Library</h3>
            <p className="text-sm text-gray-500">{filteredBooks.length} books</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="lastRead">Sort by Last Read</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {/* Books Grid/List */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add your first book to get started'
            }
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredBooks.slice(0, 6).map(book => (
            <div
              key={book.id}
              className={`bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer ${
                viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(book.categoryId)}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(book.categoryId) }} />
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{book.author}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{book.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${book.progress.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLastRead(book.progress.lastRead)}
                      </span>
                      <span>{book.progress.currentPage}/{book.progress.totalPages} pages</span>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(book.categoryId)}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(book.categoryId) }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{book.author}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">{formatLastRead(book.progress.lastRead)}</span>
                      <span className="text-xs text-gray-500">{book.progress.percentage}% complete</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${book.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {filteredBooks.length > 6 && (
        <div className="mt-6 text-center">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All Books
            <span className="text-sm text-gray-500">({filteredBooks.length})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadingLibraryWidget;