/**
 * Demo Book Service - Loads and manages demo books for testing
 */

export interface DemoBook {
  id: string;
  title: string;
  author: string;
  content: string;
  readingProgress: {
    currentPosition: number;
    currentChapter?: number;
    bookmarks: Array<{
      id: string;
      position: number;
      text?: string;
      note?: string;
    }>;
  };
}

class DemoBookService {
  private books: Map<string, DemoBook> = new Map();

  constructor() {
    this.loadDemoBooks();
  }

  private async loadDemoBooks() {
    try {
      // Load the markdown book
      const markdownBook = await this.loadMarkdownBook();
      this.books.set('demo-archmage', markdownBook);

      // Load the EPUB book (placeholder for now)
      const epubBook = await this.loadEpubBook();
      this.books.set('demo-time-traveler', epubBook);

      console.log('Demo books loaded successfully');
    } catch (error) {
      console.error('Failed to load demo books:', error);
    }
  }

  private async loadMarkdownBook(): Promise<DemoBook> {
    try {
      const response = await fetch('/uploads/new_life_as_a_max_level_archmage_by_arcanecadence.md');
      const content = await response.text();
      
      // Parse the markdown content
      const lines = content.split('\n');
      const title = lines[0]?.replace('# ', '') || 'New Life As A Max Level Archmage';
      const author = lines[2]?.replace('**Author:** ', '') || 'ArcaneCadence';
      
      // Extract the main content (skip metadata)
      const contentStart = lines.findIndex(line => line.includes('## Chapter 1'));
      const mainContent = lines.slice(contentStart).join('\n');
      
      return {
        id: 'demo-archmage',
        title,
        author,
        content: this.convertMarkdownToHtml(mainContent),
        readingProgress: {
          currentPosition: 0.1,
          currentChapter: 1,
          bookmarks: []
        }
      };
    } catch (error) {
      console.error('Failed to load markdown book:', error);
      return this.getFallbackBook();
    }
  }

  private async loadEpubBook(): Promise<DemoBook> {
    // For now, return a placeholder since EPUB parsing is complex
    return {
      id: 'demo-time-traveler',
      title: 'The Time Traveler\'s Wife',
      author: 'Audrey Niffenegger',
      content: `
        <h1>The Time Traveler's Wife</h1>
        <p>This is a demo version of The Time Traveler's Wife. The full EPUB content would be parsed and converted here.</p>
        <p>In a real implementation, we would use a library like epub.js to parse the EPUB file and extract its content.</p>
        <p>For now, this serves as a placeholder to test the reading interface with multiple books.</p>
      `,
      readingProgress: {
        currentPosition: 0.05,
        currentChapter: 1,
        bookmarks: []
      }
    };
  }

  private convertMarkdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle existing HTML paragraphs with classes
      .replace(/<p class="[^"]*">(.*?)<\/p>/g, '<p>$1</p>')
      // Line breaks
      .replace(/\n/g, '<br>\n');

    return html;
  }

  private getFallbackBook(): DemoBook {
    return {
      id: 'demo-fallback',
      title: 'Demo Book',
      author: 'Demo Author',
      content: `
        <h1>Demo Book</h1>
        <p>This is a fallback demo book for testing the reading interface.</p>
        <p>It contains multiple paragraphs to test the reading experience.</p>
        <p>The book would normally contain the full content of an uploaded book.</p>
      `,
      readingProgress: {
        currentPosition: 0.1,
        currentChapter: 1,
        bookmarks: []
      }
    };
  }

  public async getBook(bookId: string): Promise<DemoBook | null> {
    return this.books.get(bookId) || null;
  }

  public async getAllBooks(): Promise<DemoBook[]> {
    return Array.from(this.books.values());
  }

  public async updateReadingProgress(bookId: string, position: number): Promise<void> {
    const book = this.books.get(bookId);
    if (book) {
      book.readingProgress.currentPosition = position;
    }
  }

  public async addBookmark(bookId: string, bookmark: {
    position: number;
    text?: string;
    note?: string;
  }): Promise<void> {
    const book = this.books.get(bookId);
    if (book) {
      book.readingProgress.bookmarks.push({
        id: `bookmark-${Date.now()}`,
        ...bookmark
      });
    }
  }
}

export const demoBookService = new DemoBookService(); 