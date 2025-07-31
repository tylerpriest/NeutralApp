import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Upload, 
  BookOpen, 
  Star, 
  Clock, 
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Share
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  dateAdded: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'dateAdded' | 'lastRead' | 'rating'>('title');
  const [showAddBook, setShowAddBook] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockBooks: Book[] = [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
          progress: { currentPage: 45, totalPages: 180, percentage: 25, lastRead: '2024-01-15T10:30:00Z' },
          rating: 4,
          tags: ['fiction', 'classic', 'romance'],
          categoryId: 'fiction',
          dateAdded: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: '1984',
          author: 'George Orwell',
          description: 'A dystopian social science fiction novel and cautionary tale.',
          progress: { currentPage: 120, totalPages: 328, percentage: 37, lastRead: '2024-01-14T15:20:00Z' },
          rating: 5,
          tags: ['fiction', 'dystopian', 'political'],
          categoryId: 'fiction',
          dateAdded: '2024-01-02T00:00:00Z'
        },
        {
          id: '3',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          description: 'A handbook of agile software craftsmanship.',
          progress: { currentPage: 0, totalPages: 464, percentage: 0, lastRead: null },
          rating: 0,
          tags: ['technical', 'programming', 'software'],
          categoryId: 'technical',
          dateAdded: '2024-01-03T00:00:00Z'
        }
      ];

      const mockCategories: Category[] = [
        { id: 'fiction', name: 'Fiction', color: '#3B82F6', icon: '📚' },
        { id: 'technical', name: 'Technical', color: '#8B5CF6', icon: '💻' },
        { id: 'non-fiction', name: 'Non-Fiction', color: '#10B981', icon: '📖' }
      ];

      setBooks(mockBooks);
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || book.categoryId === selectedCategory;
      
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'reading' && book.progress.percentage > 0 && book.progress.percentage < 100) ||
        (selectedStatus === 'completed' && book.progress.percentage >= 100) ||
        (selectedStatus === 'to-read' && book.progress.percentage === 0);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
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

  const handleBookClick = (bookId: string) => {
    navigate(`/reader/book/${bookId}`);
  };

  const handleAddBook = () => {
    setShowAddBook(true);
  };

  const handleImportBooks = () => {
    // TODO: Implement book import functionality
    console.log('Import books');
  };

  const handleBookSelection = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'share') => {
    console.log(`${action} books:`, selectedBooks);
    setSelectedBooks([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📚 Library</h1>
              <p className="text-gray-600">{filteredBooks.length} books in your collection</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleImportBooks}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              
              <button
                onClick={handleAddBook}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="reading">Currently Reading</option>
                <option value="completed">Completed</option>
                <option value="to-read">To Read</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="dateAdded">Sort by Date Added</option>
                <option value="lastRead">Sort by Last Read</option>
                <option value="rating">Sort by Rating</option>
              </select>

              <div className="flex items-center space-x-1">
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
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBooks.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('share')}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Share className="w-3 h-3" />
                Share
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books Grid/List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first book to get started'
              }
            </p>
            <button
              onClick={handleAddBook}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Book
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredBooks.map(book => (
              <div
                key={book.id}
                className={`bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-4'
                } ${selectedBooks.includes(book.id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleBookClick(book.id)}
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
                    
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
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
                      <h3 className="font-medium text-gray-900 truncate">{book.title}</h3>
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
      </div>
    </div>
  );
};

export default LibraryPage; 