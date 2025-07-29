/**
 * Reading Core Plugin Types
 * Defines interfaces and types for the book library management system
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  content?: string;
  contentType: 'text' | 'html' | 'epub' | 'pdf';
  fileSize?: number;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  categories: string[];
  tags: string[];
  metadata: BookMetadata;
  readingProgress: ReadingProgress;
  dateAdded: string;
  lastModified: string;
}

export interface BookMetadata {
  importSource?: 'manual' | 'epub' | 'web' | 'api';
  originalUrl?: string;
  importDate?: string;
  fileFormat?: string;
  encoding?: string;
  customFields: Record<string, unknown>;
}

export interface ReadingProgress {
  currentPosition: number; // 0-1 (percentage)
  currentChapter?: number;
  currentPage?: number;
  totalPages?: number;
  lastReadDate?: string;
  readingTime?: number; // in minutes
  isCompleted: boolean;
  bookmarks: Bookmark[];
  notes: Note[];
}

export interface Bookmark {
  id: string;
  position: number; // 0-1 (percentage)
  chapter?: number;
  page?: number;
  text?: string; // Selected text at bookmark
  note?: string;
  dateCreated: string;
}

export interface Note {
  id: string;
  position: number;
  chapter?: number;
  page?: number;
  selectedText?: string;
  noteText: string;
  highlightColor?: string;
  dateCreated: string;
  lastModified: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  dateCreated: string;
}

export interface LibraryStats {
  totalBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  totalReadingTime: number;
  averageReadingSpeed: number; // words per minute
  favoriteGenres: string[];
  recentActivity: ActivityEntry[];
}

export interface ActivityEntry {
  id: string;
  type: 'book_added' | 'reading_started' | 'reading_completed' | 'bookmark_added' | 'note_added';
  bookId: string;
  bookTitle: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface SearchQuery {
  term?: string;
  author?: string;
  category?: string;
  tags?: string[];
  isCompleted?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'title' | 'author' | 'dateAdded' | 'lastRead' | 'progress';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  books: Book[];
  totalCount: number;
  hasMore: boolean;
}

export interface LibraryService {
  // Book management
  addBook(book: Omit<Book, 'id' | 'dateAdded' | 'lastModified'>): Promise<Book>;
  updateBook(id: string, updates: Partial<Book>): Promise<Book>;
  removeBook(id: string): Promise<void>;
  getBook(id: string): Promise<Book | null>;
  getAllBooks(): Promise<Book[]>;
  searchBooks(query: SearchQuery): Promise<SearchResult>;
  
  // Category management
  createCategory(category: Omit<Category, 'id' | 'dateCreated'>): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  getAllCategories(): Promise<Category[]>;
  
  // Reading progress
  updateReadingProgress(bookId: string, progress: Partial<ReadingProgress>): Promise<void>;
  addBookmark(bookId: string, bookmark: Omit<Bookmark, 'id' | 'dateCreated'>): Promise<Bookmark>;
  removeBookmark(bookId: string, bookmarkId: string): Promise<void>;
  addNote(bookId: string, note: Omit<Note, 'id' | 'dateCreated' | 'lastModified'>): Promise<Note>;
  updateNote(bookId: string, noteId: string, updates: Partial<Note>): Promise<Note>;
  removeNote(bookId: string, noteId: string): Promise<void>;
  
  // Statistics and analytics
  getLibraryStats(): Promise<LibraryStats>;
  getRecentActivity(limit?: number): Promise<ActivityEntry[]>;
  
  // Import/Export
  exportLibrary(): Promise<string>; // JSON export
  importLibrary(data: string): Promise<{ imported: number; errors: string[] }>;
  
  // Events
  onLibraryChange(callback: (event: LibraryChangeEvent) => void): () => void;
}

export interface LibraryChangeEvent {
  type: 'book_added' | 'book_updated' | 'book_removed' | 'category_added' | 'category_updated' | 'category_removed';
  bookId?: string;
  categoryId?: string;
  data?: unknown;
  timestamp: string;
}

export interface ReadingCoreAPI {
  library: LibraryService;
  getCurrentBook(): Promise<Book | null>;
  setCurrentBook(bookId: string): Promise<void>;
  clearCurrentBook(): Promise<void>;
  updateSidebarBadge(itemId: string, badge: string | number | null): Promise<void>;
}