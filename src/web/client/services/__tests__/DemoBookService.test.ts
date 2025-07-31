import { demoBookService, DemoBook } from '../DemoBookService';

// Mock fetch for testing
global.fetch = jest.fn();

describe('DemoBookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBook', () => {
    it('should return a demo book when available', async () => {
      // Mock the fetch response for the markdown book
      (fetch as jest.Mock).mockResolvedValueOnce({
        text: () => Promise.resolve(`
# New Life As A Max Level Archmage

**Author:** ArcaneCadence

## Chapter 1: 1 - Vivisari

<p>Vivi opened her eyes to the Burial Room of the Ashen Hierophant.</p>
<p>It had been two years since she had logged into The Seven Cataclysms...</p>
        `)
      });

      const book = await demoBookService.getBook('demo-archmage');
      
      expect(book).toBeDefined();
      expect(book?.title).toBe('New Life As A Max Level Archmage');
      expect(book?.author).toBe('ArcaneCadence');
      expect(book?.content).toContain('<h2>Chapter 1: 1 - Vivisari</h2>');
    });

    it('should return null for non-existent books', async () => {
      const book = await demoBookService.getBook('non-existent');
      expect(book).toBeNull();
    });
  });

  describe('getAllBooks', () => {
    it('should return all available demo books', async () => {
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        text: () => Promise.resolve(`
# New Life As A Max Level Archmage
**Author:** ArcaneCadence
## Chapter 1
<p>Content here</p>
        `)
      });

      const books = await demoBookService.getAllBooks();
      
      expect(books).toBeInstanceOf(Array);
      expect(books.length).toBeGreaterThan(0);
      expect(books[0]).toHaveProperty('id');
      expect(books[0]).toHaveProperty('title');
      expect(books[0]).toHaveProperty('author');
      expect(books[0]).toHaveProperty('content');
      expect(books[0]).toHaveProperty('readingProgress');
    });
  });

  describe('updateReadingProgress', () => {
    it('should update reading progress for a book', async () => {
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        text: () => Promise.resolve(`
# Test Book
**Author:** Test Author
## Chapter 1
<p>Content here</p>
        `)
      });

      await demoBookService.updateReadingProgress('demo-archmage', 0.5);
      const book = await demoBookService.getBook('demo-archmage');
      
      expect(book?.readingProgress.currentPosition).toBe(0.5);
    });
  });

  describe('addBookmark', () => {
    it('should add a bookmark to a book', async () => {
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        text: () => Promise.resolve(`
# Test Book
**Author:** Test Author
## Chapter 1
<p>Content here</p>
        `)
      });

      await demoBookService.addBookmark('demo-archmage', {
        position: 0.25,
        text: 'Test bookmark',
        note: 'Test note'
      });

      const book = await demoBookService.getBook('demo-archmage');
      
      expect(book?.readingProgress.bookmarks).toHaveLength(1);
      expect(book?.readingProgress.bookmarks[0]).toMatchObject({
        position: 0.25,
        text: 'Test bookmark',
        note: 'Test note'
      });
    });
  });
}); 