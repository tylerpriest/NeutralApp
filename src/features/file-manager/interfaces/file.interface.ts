/**
 * File Management Interface - Industry Standards
 * Supports multiple formats with AI-ready chunking capabilities
 */

export interface FileFormat {
  extension: string;
  mimeType: string;
  name: string;
  category: 'ebook' | 'document' | 'text' | 'audio' | 'video';
  supportsChunking: boolean;
  supportsAI: boolean;
}

export interface FileChunk {
  id: string;
  fileId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    startPosition: number;
    endPosition: number;
    characterCount: number;
    wordCount: number;
    tokens?: number; // For AI processing
    language?: string;
    chapter?: string;
    section?: string;
  };
  embeddings?: number[]; // Vector embeddings for AI
}

export interface FileMetadata {
  id: string;
  originalName: string;
  cleanName: string; // Sanitized filename
  extension: string;
  mimeType: string;
  size: number;
  hash: string; // SHA-256 for deduplication
  format: FileFormat;
  
  // Content metadata
  encoding?: string;
  language?: string;
  wordCount?: number;
  pageCount?: number;
  chapterCount?: number;
  
  // Processing status
  isProcessed: boolean;
  isChunked: boolean;
  hasEmbeddings: boolean;
  processingError?: string;
  
  // Storage info
  storagePath: string;
  cloudUrl?: string;
  backupUrls?: string[];
  
  // Timestamps
  uploadedAt: string;
  processedAt?: string;
  lastAccessedAt?: string;
  
  // User context
  uploadedBy: string;
  tags: string[];
  categories: string[];
  
  // AI metadata
  aiSummary?: string;
  keyTopics?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ProcessingJob {
  id: string;
  fileId: string;
  type: 'chunking' | 'embedding' | 'extraction' | 'conversion';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

export interface StorageConfig {
  localPath: string;
  maxFileSize: number; // bytes
  allowedFormats: string[];
  chunkSize: number; // characters per chunk
  cloudProvider?: 'aws' | 'gcp' | 'azure';
  cloudBucket?: string;
  enableBackup: boolean;
  compressionLevel: number; // 0-9
}

export interface IFileManager {
  // File upload and processing
  uploadFile(file: File, metadata?: Partial<FileMetadata>): Promise<FileMetadata>;
  processFile(fileId: string, options?: ProcessingOptions): Promise<ProcessingJob>;
  
  // File retrieval
  getFile(fileId: string): Promise<FileMetadata | null>;
  getFileContent(fileId: string): Promise<string>;
  getFileChunks(fileId: string, options?: ChunkQuery): Promise<FileChunk[]>;
  searchFiles(query: FileSearchQuery): Promise<FileMetadata[]>;
  
  // Chunk management
  createChunks(fileId: string, options?: ChunkingOptions): Promise<FileChunk[]>;
  getChunk(chunkId: string): Promise<FileChunk | null>;
  searchChunks(query: ChunkSearchQuery): Promise<FileChunk[]>;
  
  // File operations
  deleteFile(fileId: string, removeChunks?: boolean): Promise<void>;
  duplicateFile(fileId: string): Promise<FileMetadata>;
  moveFile(fileId: string, newPath: string): Promise<FileMetadata>;
  
  // Batch operations
  processBatch(fileIds: string[], operation: BatchOperation): Promise<ProcessingJob[]>;
  
  // Cloud storage
  syncToCloud(fileId: string): Promise<string>; // Returns cloud URL
  syncFromCloud(cloudUrl: string): Promise<FileMetadata>;
  
  // AI integration
  generateEmbeddings(fileId: string): Promise<void>;
  semanticSearch(query: string, limit?: number): Promise<FileChunk[]>;
  summarizeFile(fileId: string): Promise<string>;
  
  // Analytics
  getStorageStats(): Promise<StorageStats>;
  getProcessingStats(): Promise<ProcessingStats>;
}

export interface ProcessingOptions {
  chunkSize?: number;
  generateEmbeddings?: boolean;
  extractMetadata?: boolean;
  generateSummary?: boolean;
  detectLanguage?: boolean;
}

export interface ChunkingOptions {
  size: number; // characters
  overlap: number; // characters to overlap between chunks
  respectSentences: boolean;
  respectParagraphs: boolean;
  respectSections: boolean;
}

export interface ChunkQuery {
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
  includeEmbeddings?: boolean;
}

export interface FileSearchQuery {
  term?: string;
  categories?: string[];
  tags?: string[];
  formats?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'lastAccessedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ChunkSearchQuery {
  term: string;
  fileIds?: string[];
  semantic?: boolean; // Use vector similarity
  threshold?: number; // Similarity threshold (0-1)
  limit?: number;
  includeContext?: boolean; // Include surrounding chunks
}

export interface BatchOperation {
  type: 'delete' | 'process' | 'move' | 'tag' | 'categorize';
  params?: any;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  availableSpace: number;
  filesByFormat: Record<string, number>;
  filesByCategory: Record<string, number>;
  processingQueue: number;
  chunkedFiles: number;
  filesWithEmbeddings: number;
}

export interface ProcessingStats {
  totalProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  errorsByType: Record<string, number>;
  queueLength: number;
  activeJobs: number;
}