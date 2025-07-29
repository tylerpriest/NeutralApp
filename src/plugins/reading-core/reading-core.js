/**
 * Reading Core Plugin - JavaScript Implementation
 * Provides comprehensive book library management
 */

class ReadingCorePlugin {
  constructor(api) {
    this.api = api;
    this.pluginId = 'reading-core';
    this.books = new Map();
    this.categories = new Map();
    this.storageKey = 'reading-core-library';
    this.isActive = false;
    
    this.loadFromStorage();
    this.initializeDefaultCategories();
  }

  async initialize() {
    console.log('Reading Core Plugin: Initializing...');
    
    try {
      // Create main library widget
      await this.api.ui.createWidget({
        id: 'reading-core-library',
        title: 'Book Library',
        type: 'custom',
        size: { width: 4, height: 3 },
        position: { x: 0, y: 0 },
        config: {
          content: this.renderLibraryWidget()
        }
      });

      // Create recent books widget
      await this.api.ui.createWidget({
        id: 'reading-core-recent',
        title: 'Recently Read',
        type: 'custom',
        size: { width: 2, height: 2 },
        position: { x: 4, y: 0 },
        config: {
          content: this.renderRecentWidget()
        }
      });

      console.log('Reading Core Plugin: Widgets created successfully');
      return true;
    } catch (error) {
      console.error('Reading Core Plugin: Initialization failed:', error);
      throw error;
    }
  }

  async activate() {
    this.isActive = true;
    console.log('Reading Core Plugin: Activated');
    
    // Set up periodic widget updates
    this.updateInterval = setInterval(() => {
      this.updateWidgets();
    }, 30000); // Update every 30 seconds

    return true;
  }

  async deactivate() {
    this.isActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    console.log('Reading Core Plugin: Deactivated');
    return true;
  }

  async cleanup() {
    this.deactivate();
  }

  // Data persistence
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.books) {
          parsed.books.forEach(book => this.books.set(book.id, book));
        }
        if (parsed.categories) {
          parsed.categories.forEach(cat => this.categories.set(cat.id, cat));
        }
      }
    } catch (error) {
      console.error('Failed to load reading core data:', error);
    }
  }

  saveToStorage() {
    try {
      const data = {
        books: Array.from(this.books.values()),
        categories: Array.from(this.categories.values()),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save reading core data:', error);
    }
  }

  initializeDefaultCategories() {
    if (this.categories.size === 0) {
      const defaultCategories = [
        { name: 'Fiction', color: '#3B82F6', icon: '📚' },
        { name: 'Non-Fiction', color: '#10B981', icon: '📖' },
        { name: 'Technical', color: '#8B5CF6', icon: '💻' },
        { name: 'Web Novels', color: '#F59E0B', icon: '🌐' },
        { name: 'To Read', color: '#EF4444', icon: '📋' }
      ];

      defaultCategories.forEach((cat, index) => {
        const category = {
          id: this.generateId(),
          ...cat,
          sortOrder: index + 1,
          dateCreated: new Date().toISOString()
        };
        this.categories.set(category.id, category);
      });
      
      this.saveToStorage();
    }
  }

  // Library management
  addBook(bookData) {
    const book = {
      id: this.generateId(),
      title: bookData.title || 'Untitled',
      author: bookData.author || 'Unknown Author',
      description: bookData.description || '',
      content: bookData.content || '',
      contentType: bookData.contentType || 'text',
      categories: bookData.categories || [],
      tags: bookData.tags || [],
      readingProgress: {
        currentPosition: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        ...bookData.readingProgress
      },
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ...bookData
    };

    this.books.set(book.id, book);
    this.saveToStorage();
    this.updateWidgets();
    
    console.log(`Book added: ${book.title}`);
    return book;
  }

  getBook(id) {
    return this.books.get(id) || null;
  }

  getAllBooks() {
    return Array.from(this.books.values());
  }

  updateBook(id, updates) {
    const book = this.books.get(id);
    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    const updatedBook = {
      ...book,
      ...updates,
      id, // Ensure ID cannot be changed
      lastModified: new Date().toISOString()
    };

    this.books.set(id, updatedBook);
    this.saveToStorage();
    this.updateWidgets();
    
    return updatedBook;
  }

  removeBook(id) {
    const book = this.books.get(id);
    if (!book) {
      throw new Error(`Book with id ${id} not found`);
    }

    this.books.delete(id);
    this.saveToStorage();
    this.updateWidgets();
    
    console.log(`Book removed: ${book.title}`);
  }

  searchBooks(query) {
    let books = Array.from(this.books.values());
    
    if (query.term) {
      const term = query.term.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        (book.description && book.description.toLowerCase().includes(term))
      );
    }

    if (query.category) {
      books = books.filter(book => book.categories.includes(query.category));
    }

    return books;
  }

  // Widget rendering
  renderLibraryWidget() {
    const books = this.getAllBooks();
    const categories = Array.from(this.categories.values());
    
    const stats = {
      total: books.length,
      completed: books.filter(b => b.readingProgress.isCompleted).length,
      inProgress: books.filter(b => b.readingProgress.currentPosition > 0 && !b.readingProgress.isCompleted).length
    };

    return `
      <div style="padding: 16px; height: 100%; background: white; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #1a1a1a; font-size: 18px;">My Library</h3>
          <button onclick="window.readingCore?.showAddBookDialog()" style="
            background: #3B82F6; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 12px;
          ">+ Add Book</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
          <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 4px;">
            <div style="font-size: 20px; font-weight: bold; color: #3B82F6;">${stats.total}</div>
            <div style="font-size: 10px; color: #6b7280;">Total Books</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 4px;">
            <div style="font-size: 20px; font-weight: bold; color: #10B981;">${stats.completed}</div>
            <div style="font-size: 10px; color: #6b7280;">Completed</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 4px;">
            <div style="font-size: 20px; font-weight: bold; color: #F59E0B;">${stats.inProgress}</div>
            <div style="font-size: 10px; color: #6b7280;">In Progress</div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <input type="text" placeholder="Search books..." style="
            width: 100%; 
            padding: 8px; 
            border: 1px solid #e5e7eb; 
            border-radius: 4px; 
            font-size: 12px;
          " oninput="window.readingCore?.searchBooks(this.value)">
        </div>

        <div style="max-height: 180px; overflow-y: auto;">
          ${books.slice(0, 10).map(book => `
            <div style="
              display: flex; 
              align-items: center; 
              padding: 8px; 
              margin-bottom: 4px; 
              background: #f9fafb; 
              border-radius: 4px;
              cursor: pointer;
            " onclick="window.readingCore?.openBook('${book.id}')">
              <div style="width: 24px; height: 32px; background: ${this.getBookCoverColor(book)}; border-radius: 2px; margin-right: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px;">📖</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 12px; font-weight: 500; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${book.title}</div>
                <div style="font-size: 10px; color: #6b7280;">${book.author}</div>
                <div style="width: 100%; height: 2px; background: #e5e7eb; border-radius: 1px; margin-top: 2px;">
                  <div style="width: ${Math.round(book.readingProgress.currentPosition * 100)}%; height: 100%; background: #3B82F6; border-radius: 1px;"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${books.length === 0 ? `
          <div style="text-align: center; padding: 32px; color: #6b7280;">
            <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
            <div style="font-size: 14px;">No books in your library yet</div>
            <div style="font-size: 12px; margin-top: 4px;">Add your first book to get started!</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderRecentWidget() {
    const books = this.getAllBooks()
      .filter(book => book.readingProgress.lastReadDate)
      .sort((a, b) => new Date(b.readingProgress.lastReadDate || 0).getTime() - new Date(a.readingProgress.lastReadDate || 0).getTime())
      .slice(0, 5);

    return `
      <div style="padding: 16px; height: 100%; background: white; border-radius: 8px;">
        <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 16px;">Recently Read</h3>
        
        ${books.length > 0 ? books.map(book => `
          <div style="
            display: flex; 
            align-items: center; 
            padding: 6px; 
            margin-bottom: 6px; 
            background: #f9fafb; 
            border-radius: 4px;
            cursor: pointer;
          " onclick="window.readingCore?.openBook('${book.id}')">
            <div style="width: 20px; height: 26px; background: ${this.getBookCoverColor(book)}; border-radius: 2px; margin-right: 8px; display: flex; align-items: center; justify-content: center; font-size: 8px;">📖</div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; font-weight: 500; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${book.title}</div>
              <div style="font-size: 9px; color: #6b7280;">${Math.round(book.readingProgress.currentPosition * 100)}% complete</div>
            </div>
          </div>
        `).join('') : `
          <div style="text-align: center; padding: 16px; color: #6b7280;">
            <div style="font-size: 24px; margin-bottom: 8px;">📖</div>
            <div style="font-size: 12px;">No recent reading</div>
          </div>
        `}
      </div>
    `;
  }

  // Helper methods
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  getBookCoverColor(book) {
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
    const hash = book.title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  async updateWidgets() {
    if (!this.isActive) return;

    try {
      await this.api.ui.updateWidget('reading-core-library', {
        content: this.renderLibraryWidget(),
        lastUpdated: new Date().toISOString()
      });

      await this.api.ui.updateWidget('reading-core-recent', {
        content: this.renderRecentWidget(),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update reading core widgets:', error);
    }
  }

  // Global methods for widget interactions
  setupGlobalMethods() {
    window.readingCore = {
      openBook: (bookId) => {
        const book = this.getBook(bookId);
        if (book) {
          console.log(`Opening book: ${book.title}`);
          // This would trigger the reading-ui plugin
          if (this.api.events) {
            this.api.events.publish('reading:open-book', { bookId, book });
          }
        }
      },
      
      showAddBookDialog: () => {
        console.log('Show add book dialog');
        // This would open a modal for adding books
        const title = prompt('Enter book title:');
        if (title) {
          const author = prompt('Enter author:') || 'Unknown Author';
          const content = prompt('Enter book content (or leave empty):') || 'Sample content for ' + title;
          
          this.addBook({
            title,
            author,
            content,
            contentType: 'text'
          });
        }
      },
      
      searchBooks: (term) => {
        console.log(`Searching for: ${term}`);
        const results = this.searchBooks({ term });
        console.log(`Found ${results.length} books`);
        // Update widget with search results
        this.updateWidgets();
      }
    };
  }
}

// Export for plugin system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    activate: function(api) {
      const plugin = new ReadingCorePlugin(api);
      plugin.setupGlobalMethods();
      return plugin;
    }
  };
}