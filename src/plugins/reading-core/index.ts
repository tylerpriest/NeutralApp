/**
 * Reading Core Plugin
 * Provides comprehensive book library management with metadata handling,
 * categories, search functionality, and cross-plugin communication APIs
 */

import { 
  Book, 
  Category, 
  LibraryService, 
  SearchQuery, 
  SearchResult,
  ReadingProgress,
  Bookmark,
  Note,
  LibraryStats,
  ActivityEntry,
  LibraryChangeEvent,
  ReadingCoreAPI
} from './types';

class LibraryServiceImpl implements LibraryService {
  private books: Map<string, Book> = new Map();
  private categories: Map<string, Category> = new Map();
  private currentBookId: string | null = null;
  private listeners: ((event: LibraryChangeEvent) => void)[] = [];
  private readonly storageKey = 'reading-core-library';
  private readonly categoriesKey = 'reading-core-categories';

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultCategories();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // Load books
      const booksData = localStorage.getItem(this.storageKey);
      if (booksData) {
        const books: Book[] = JSON.parse(booksData);
        books.forEach(book => this.books.set(book.id, book));
      }

      // Load categories
      const categoriesData = localStorage.getItem(this.categoriesKey);
      if (categoriesData) {
        const categories: Category[] = JSON.parse(categoriesData);
        categories.forEach(category => this.categories.set(category.id, category));
      }
    } catch (error) {
      console.error('Failed to load library data from storage:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      // Save books
      const books = Array.from(this.books.values());
      localStorage.setItem(this.storageKey, JSON.stringify(books));

      // Save categories
      const categories = Array.from(this.categories.values());
      localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save library data to storage:', error);
    }
  }

  private initializeDefaultCategories(): void {
    if (this.categories.size === 0) {
      const defaultCategories: Omit<Category, 'id' | 'dateCreated'>[] = [
        { name: 'Fiction', description: 'Fictional works and novels', color: '#3B82F6', icon: '📚', sortOrder: 1 },
        { name: 'Non-Fiction', description: 'Educational and factual content', color: '#10B981', icon: '📖', sortOrder: 2 },
        { name: 'Technical', description: 'Programming and technical documentation', color: '#8B5CF6', icon: '💻', sortOrder: 3 },
        { name: 'Web Novels', description: 'Online novels and web serials', color: '#F59E0B', icon: '🌐', sortOrder: 4 },
        { name: 'To Read', description: 'Books marked for future reading', color: '#EF4444', icon: '📋', sortOrder: 5 }
      ];

      defaultCategories.forEach(async (cat) => {
        await this.createCategory(cat);
      });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private emitEvent(event: LibraryChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in library event listener:', error);
      }
    });
  }

  // Book management
  async addBook(bookData: Omit<Book, 'id' | 'dateAdded' | 'lastModified'>): Promise<Book> {
    const book: Book = {
      ...bookData,
      id: this.generateId(),
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      readingProgress: {
        ...bookData.readingProgress,
        currentPosition: bookData.readingProgress?.currentPosition || 0,
        isCompleted: bookData.readingProgress?.isCompleted || false,
        bookmarks: bookData.readingProgress?.bookmarks || [],
        notes: bookData.readingProgress?.notes || []
      }
    };

    this.books.set(book.id, book);
    await this.saveToStorage();

    this.emitEvent({
      type: 'book_added',
      bookId: book.id,
      data: book,
      timestamp: new Date().toISOString()
    });

    return book;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    const existingBook = this.books.get(id);
    if (!existingBook) {
      throw new Error(`Book with id ${id} not found`);
    }

    const updatedBook: Book = {
      ...existingBook,
      ...updates,
      id, // Ensure ID cannot be changed
      lastModified: new Date().toISOString()
    };

    this.books.set(id, updatedBook);
    await this.saveToStorage();

    this.emitEvent({
      type: 'book_updated',
      bookId: id,
      data: updatedBook,
      timestamp: new Date().toISOString()
    });

    return updatedBook;
  }

  async removeBook(id: string): Promise<void> {
    const book = this.books.get(id);
    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    this.books.delete(id);
    if (this.currentBookId === id) {
      this.currentBookId = null;
    }
    await this.saveToStorage();

    this.emitEvent({
      type: 'book_removed',
      bookId: id,
      data: book,
      timestamp: new Date().toISOString()
    });
  }

  async getBook(id: string): Promise<Book | null> {
    return this.books.get(id) || null;
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async searchBooks(query: SearchQuery): Promise<SearchResult> {
    let books = Array.from(this.books.values());

    // Apply filters
    if (query.term) {
      const term = query.term.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.description?.toLowerCase().includes(term) ||
        book.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (query.author) {
      const author = query.author.toLowerCase();
      books = books.filter(book => book.author.toLowerCase().includes(author));
    }

    if (query.category) {
      books = books.filter(book => book.categories.includes(query.category!));
    }

    if (query.tags && query.tags.length > 0) {
      books = books.filter(book => 
        query.tags!.some(tag => book.tags.includes(tag))
      );
    }

    if (query.isCompleted !== undefined) {
      books = books.filter(book => book.readingProgress.isCompleted === query.isCompleted);
    }

    if (query.dateRange) {
      const start = new Date(query.dateRange.start);
      const end = new Date(query.dateRange.end);
      books = books.filter(book => {
        const bookDate = new Date(book.dateAdded);
        return bookDate >= start && bookDate <= end;
      });
    }

    // Apply sorting
    const sortBy = query.sortBy || 'title';
    const sortOrder = query.sortOrder || 'asc';
    books.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'dateAdded':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case 'lastRead':
          const aLastRead = a.readingProgress.lastReadDate || '1970-01-01';
          const bLastRead = b.readingProgress.lastReadDate || '1970-01-01';
          comparison = new Date(aLastRead).getTime() - new Date(bLastRead).getTime();
          break;
        case 'progress':
          comparison = a.readingProgress.currentPosition - b.readingProgress.currentPosition;
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const totalCount = books.length;
    const offset = query.offset || 0;
    const limit = query.limit || totalCount;
    const paginatedBooks = books.slice(offset, offset + limit);

    return {
      books: paginatedBooks,
      totalCount,
      hasMore: offset + limit < totalCount
    };
  }

  // Category management
  async createCategory(categoryData: Omit<Category, 'id' | 'dateCreated'>): Promise<Category> {
    const category: Category = {
      ...categoryData,
      id: this.generateId(),
      dateCreated: new Date().toISOString()
    };

    this.categories.set(category.id, category);
    await this.saveToStorage();

    this.emitEvent({
      type: 'category_added',
      categoryId: category.id,
      data: category,
      timestamp: new Date().toISOString()
    });

    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      throw new Error(`Category with id ${id} not found`);
    }

    const updatedCategory: Category = {
      ...existingCategory,
      ...updates,
      id // Ensure ID cannot be changed
    };

    this.categories.set(id, updatedCategory);
    await this.saveToStorage();

    this.emitEvent({
      type: 'category_updated',
      categoryId: id,
      data: updatedCategory,
      timestamp: new Date().toISOString()
    });

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }

    // Remove category from all books
    for (const book of this.books.values()) {
      if (book.categories.includes(category.name)) {
        const updatedCategories = book.categories.filter(cat => cat !== category.name);
        await this.updateBook(book.id, { categories: updatedCategories });
      }
    }

    this.categories.delete(id);
    await this.saveToStorage();

    this.emitEvent({
      type: 'category_removed',
      categoryId: id,
      data: category,
      timestamp: new Date().toISOString()
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Reading progress management
  async updateReadingProgress(bookId: string, progress: Partial<ReadingProgress>): Promise<void> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const updatedProgress: ReadingProgress = {
      ...book.readingProgress,
      ...progress,
      lastReadDate: new Date().toISOString()
    };

    await this.updateBook(bookId, { readingProgress: updatedProgress });
  }

  async addBookmark(bookId: string, bookmarkData: Omit<Bookmark, 'id' | 'dateCreated'>): Promise<Bookmark> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const bookmark: Bookmark = {
      ...bookmarkData,
      id: this.generateId(),
      dateCreated: new Date().toISOString()
    };

    const updatedBookmarks = [...book.readingProgress.bookmarks, bookmark];
    await this.updateReadingProgress(bookId, { bookmarks: updatedBookmarks });

    return bookmark;
  }

  async removeBookmark(bookId: string, bookmarkId: string): Promise<void> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const updatedBookmarks = book.readingProgress.bookmarks.filter(b => b.id !== bookmarkId);
    await this.updateReadingProgress(bookId, { bookmarks: updatedBookmarks });
  }

  async addNote(bookId: string, noteData: Omit<Note, 'id' | 'dateCreated' | 'lastModified'>): Promise<Note> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const note: Note = {
      ...noteData,
      id: this.generateId(),
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedNotes = [...book.readingProgress.notes, note];
    await this.updateReadingProgress(bookId, { notes: updatedNotes });

    return note;
  }

  async updateNote(bookId: string, noteId: string, updates: Partial<Note>): Promise<Note> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const noteIndex = book.readingProgress.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    const existingNote = book.readingProgress.notes[noteIndex];
    if (!existingNote) {
      throw new Error(`Note with id ${noteId} not found`);
    }
    
    const updatedNote: Note = {
      ...existingNote,
      ...updates,
      id: noteId, // Ensure ID cannot be changed
      position: updates.position !== undefined ? updates.position : existingNote.position,
      noteText: updates.noteText !== undefined ? updates.noteText : existingNote.noteText,
      lastModified: new Date().toISOString()
    };

    const updatedNotes = [...book.readingProgress.notes];
    updatedNotes[noteIndex] = updatedNote;
    await this.updateReadingProgress(bookId, { notes: updatedNotes });

    return updatedNote;
  }

  async removeNote(bookId: string, noteId: string): Promise<void> {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const updatedNotes = book.readingProgress.notes.filter(n => n.id !== noteId);
    await this.updateReadingProgress(bookId, { notes: updatedNotes });
  }

  // Statistics and analytics
  async getLibraryStats(): Promise<LibraryStats> {
    const books = Array.from(this.books.values());
    const totalBooks = books.length;
    const completedBooks = books.filter(book => book.readingProgress.isCompleted).length;
    const inProgressBooks = books.filter(book => 
      book.readingProgress.currentPosition > 0 && !book.readingProgress.isCompleted
    ).length;

    const totalReadingTime = books.reduce((total, book) => 
      total + (book.readingProgress.readingTime || 0), 0
    );

    // Calculate average reading speed (simple approximation)
    const totalWordsRead = books
      .filter(book => book.readingProgress.isCompleted)
      .reduce((total, book) => total + (book.wordCount || 0), 0);
    const averageReadingSpeed = totalReadingTime > 0 ? totalWordsRead / totalReadingTime : 0;

    // Get favorite genres (most common categories)
    const genreCounts: Record<string, number> = {};
    books.forEach(book => {
      book.categories.forEach(category => {
        genreCounts[category] = (genreCounts[category] || 0) + 1;
      });
    });
    const favoriteGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    // Get recent activity (mock data for now)
    const recentActivity: ActivityEntry[] = books
      .slice(-10)
      .map(book => ({
        id: this.generateId(),
        type: 'book_added' as const,
        bookId: book.id,
        bookTitle: book.title,
        timestamp: book.dateAdded
      }));

    return {
      totalBooks,
      completedBooks,
      inProgressBooks,
      totalReadingTime,
      averageReadingSpeed,
      favoriteGenres,
      recentActivity
    };
  }

  async getRecentActivity(limit: number = 20): Promise<ActivityEntry[]> {
    // This would be expanded to track actual activity events
    const books = Array.from(this.books.values());
    return books
      .slice(-limit)
      .map(book => ({
        id: this.generateId(),
        type: 'book_added' as const,
        bookId: book.id,
        bookTitle: book.title,
        timestamp: book.dateAdded
      }));
  }

  // Import/Export
  async exportLibrary(): Promise<string> {
    const data = {
      books: Array.from(this.books.values()),
      categories: Array.from(this.categories.values()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(data, null, 2);
  }

  async importLibrary(data: string): Promise<{ imported: number; errors: string[] }> {
    try {
      const importData = JSON.parse(data);
      const errors: string[] = [];
      let imported = 0;

      // Import categories first
      if (importData.categories) {
        for (const categoryData of importData.categories) {
          try {
            if (!this.categories.has(categoryData.id)) {
              this.categories.set(categoryData.id, categoryData);
            }
          } catch (error) {
            errors.push(`Failed to import category ${categoryData.name}: ${error}`);
          }
        }
      }

      // Import books
      if (importData.books) {
        for (const bookData of importData.books) {
          try {
            if (!this.books.has(bookData.id)) {
              this.books.set(bookData.id, bookData);
              imported++;
            }
          } catch (error) {
            errors.push(`Failed to import book ${bookData.title}: ${error}`);
          }
        }
      }

      await this.saveToStorage();
      return { imported, errors };
    } catch (error) {
      throw new Error(`Invalid import data: ${error}`);
    }
  }

  // Events
  onLibraryChange(callback: (event: LibraryChangeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

class ReadingCorePlugin {
  private api: any;
  private libraryService: LibraryService;

  constructor(pluginAPI: any) {
    this.api = pluginAPI;
    this.libraryService = new LibraryServiceImpl();
  }

  async initialize(): Promise<void> {
    console.log('Reading Core Plugin: Initializing...');
    
    // Register plugin pack sidebar
    await this.registerSidebar();
    
    // Create library widget
    await this.createLibraryWidget();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Register cross-plugin APIs
    this.registerCrossPluginAPIs();
    
    console.log('Reading Core Plugin: Initialized successfully');
  }

  async activate(): Promise<void> {
    console.log('Reading Core Plugin: Activating...');
    // Plugin is now active and ready to handle events
    return Promise.resolve();
  }

  async deactivate(): Promise<void> {
    console.log('Reading Core Plugin: Deactivating...');
    this.cleanupEventListeners();
    return Promise.resolve();
  }

  private async createLibraryWidget(): Promise<void> {
    try {
      // Register the library widget with proper component
      await this.api.ui.createWidget({
        id: 'reading-core-library',
        title: 'Book Library',
        type: 'react-component',
        component: 'ReadingLibraryWidget',
        size: { width: 4, height: 3 },
        position: { x: 0, y: 0 },
        pluginId: 'reading-core',
        config: {
          showSearch: true,
          showCategories: true,
          viewMode: 'grid',
          limit: 6
        }
      });

      // Register the recently read widget
      await this.api.ui.createWidget({
        id: 'reading-core-recent',
        title: 'Recently Read',
        type: 'react-component',
        component: 'RecentlyReadWidget',
        size: { width: 2, height: 2 },
        position: { x: 4, y: 0 },
        pluginId: 'reading-core',
        config: {
          limit: 5
        }
      });

      console.log('Reading Core Plugin: Widgets created successfully');
    } catch (error) {
      console.error('Reading Core Plugin: Failed to create widgets:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for book imports from other plugins
    this.api.events.subscribe('book:import', this.handleBookImport.bind(this));
    
    // Listen for reading progress updates
    this.api.events.subscribe('reading:progress', this.handleReadingProgress.bind(this));
  }

  private cleanupEventListeners(): void {
    // Cleanup would happen here
    console.log('Reading Core Plugin: Event listeners cleaned up');
  }

  private async registerSidebar(): Promise<void> {
    // Register the reading pack sidebar if sidebar API is available
    if (this.api.sidebar) {
      const { SidebarManager } = await import('../../features/ui-shell/services/sidebar.manager');
      const sidebarManager = SidebarManager.getInstance();
      
      // Create and register the reading pack sidebar
      const readingPackSidebar = sidebarManager.createReadingPackSidebar();
      sidebarManager.registerPluginPackSidebar(readingPackSidebar);
      
      console.log('Reading Core Plugin: Sidebar registered');
    }
  }

  private registerCrossPluginAPIs(): void {
    // Register the library API for other plugins to use
    this.api.registerPluginAPI('reading-core', {
      library: this.libraryService,
      getCurrentBook: async () => {
        const stats = await this.libraryService.getLibraryStats();
        if (stats.recentActivity.length > 0) {
          const activityItem = stats.recentActivity[0];
          return await this.libraryService.getBook(activityItem?.bookId || '') || null;
        }
        return null;
      },
      setCurrentBook: async (bookId: string) => {
        // This would be implemented to track current reading book
        console.log(`Setting current book to: ${bookId}`);
      },
      clearCurrentBook: async () => {
        console.log('Clearing current book');
      },
      updateSidebarBadge: async (itemId: string, badge: string | number | null) => {
        if (this.api.sidebar) {
          const { SidebarManager } = await import('../../features/ui-shell/services/sidebar.manager');
          const sidebarManager = SidebarManager.getInstance();
          sidebarManager.updateBadge(itemId, badge, 'reading-pack');
        }
      }
    } as ReadingCoreAPI);
  }

  private async handleBookImport(data: any): Promise<void> {
    console.log('Reading Core Plugin: Handling book import', data);
    // Handle book imports from epub-manager, web-importer, etc.
  }

  private async handleReadingProgress(data: any): Promise<void> {
    console.log('Reading Core Plugin: Handling reading progress update', data);
    // Handle reading progress updates from reading-ui plugin
  }

  async cleanup(): Promise<void> {
    this.cleanupEventListeners();
  }
}

/**
 * Plugin factory function
 */
export function createReadingCorePlugin(pluginAPI: any): ReadingCorePlugin {
  return new ReadingCorePlugin(pluginAPI);
}