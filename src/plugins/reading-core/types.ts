/**
 * Reading Core Plugin Types
 * Defines interfaces and types for the enhanced book library management system
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  content?: string;
  contentType: 'text' | 'html' | 'epub' | 'pdf';
  fileSize?: number;
  totalPages?: number;
  wordCount?: number;
  language?: string;
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  categoryId?: string;
  tags: string[];
  rating: number;
  readingMode: ReadingMode;
  settings: ReadingSettings;
  progress: ReadingProgress;
  bookmarks: Bookmark[];
  notes: Note[];
  metadata: BookMetadata;
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
  currentPage: number;
  totalPages: number;
  percentage: number;
  readingTime: number; // in minutes
  lastRead: string | null;
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
  readingBooks: number;
  toReadBooks: number;
  totalPages: number;
  pagesRead: number;
  averageRating: number;
  totalReadingTime: number;
  averageSpeed: number;
  readingStreak: number;
  favoriteGenres: string[];
}

export interface ActivityEntry {
  type: 'book:added' | 'progress:updated' | 'bookmark:added' | 'note:added' | 'category:created' | 'category:updated' | 'category:deleted';
  bookId: string;
  bookTitle: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface SearchQuery {
  text?: string;
  categoryId?: string;
  status?: 'reading' | 'completed' | 'to-read';
  minRating?: number;
  sortBy?: 'title' | 'author' | 'dateAdded' | 'lastRead' | 'rating';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  books: Book[];
  total: number;
  query: SearchQuery;
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
  type: 'book:added' | 'book:updated' | 'book:removed' | 'category:created' | 'category:updated' | 'category:deleted';
  book?: Book;
  bookId?: string;
  category?: Category;
  categoryId?: string;
}

export interface ReadingCoreAPI {
  library: LibraryService;
  getCurrentBook(): Promise<Book | null>;
  setCurrentBook(bookId: string): Promise<void>;
  clearCurrentBook(): Promise<void>;
  updateSidebarBadge(itemId: string, badge: string | number | null): Promise<void>;
}

// Enhanced Reading Features

export type ReadingMode = 'continuous' | 'paginated' | 'presentation' | 'distractionFree';

export interface ReadingSettings {
  defaultFontSize: number;
  defaultLineSpacing: number;
  defaultTheme: 'light' | 'dark' | 'sepia';
  defaultFontFamily: string;
  autoSaveProgress: boolean;
  readingMode: ReadingMode;
  enableAnalytics: boolean;
  enableSocialFeatures: boolean;
  enableAIFeatures: boolean;
}

export interface ReadingAnalytics {
  readingSessions: ReadingSession[];
  bookStats: Record<string, BookStats>;
  totalReadingTime: number;
  booksCompleted: number;
  averageSpeed: number;
}

export interface ReadingSession {
  bookId: string;
  startTime: string;
  duration: number;
  pagesRead: number;
}

export interface BookStats {
  totalReadingTime: number;
  totalPagesRead: number;
  sessions: number;
  averageSpeed: number;
}

export interface SocialReading {
  shareBook(book: Book, platform: string): Promise<void>;
  shareProgress(book: Book, progress: ReadingProgress): Promise<void>;
  shareNotes(book: Book, notes: Note[]): Promise<void>;
  joinReadingGroups(group: any): Promise<void>;
  participateInDiscussions(book: Book, topic: string): Promise<void>;
  createReadingChallenges(challenge: any): Promise<void>;
  getFriendRecommendations(): Promise<Book[]>;
  seeWhatFriendsAreReading(): Promise<Book[]>;
  compareReadingProgress(friendId: string): Promise<any>;
}

export interface CrossDeviceSync {
  syncProgress(deviceId: string): Promise<void>;
  syncBookmarks(deviceId: string): Promise<void>;
  syncNotes(deviceId: string): Promise<void>;
  syncSettings(deviceId: string): Promise<void>;
  downloadForOffline(book: Book): Promise<void>;
  syncWhenOnline(): Promise<void>;
  listConnectedDevices(): Promise<any[]>;
  manageDeviceSync(deviceId: string, settings: any): Promise<void>;
}

export interface AIReadingAssistant {
  summarizeChapters(chapter: any): Promise<any>;
  explainComplexConcepts(text: string): Promise<any>;
  provideContext(reference: any): Promise<any>;
  suggestReadingPace(book: Book, userSpeed: number): Promise<any>;
  highlightKeyPassages(chapter: any): Promise<any[]>;
  generateDiscussionQuestions(chapter: any): Promise<any[]>;
  createStudyGuides(book: Book): Promise<any>;
  generateFlashcards(concepts: any[]): Promise<any[]>;
  trackLearningProgress(concepts: any[]): Promise<any>;
}