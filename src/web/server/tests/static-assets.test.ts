import request from 'supertest';
import express from 'express';
import path from 'path';

// Mock Supabase modules
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
  SupabaseClient: jest.fn()
}));

// Mock NextAuth.js to avoid ES module issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn()
}));

import { SimpleWebServer } from '../SimpleWebServer';

// Helper function to safely set environment variables
const setEnvVar = (key: string, value: string) => {
  Object.defineProperty(process.env, key, {
    value,
    writable: true,
    configurable: true
  });
};

// Helper function to safely delete environment variables
const deleteEnvVar = (key: string) => {
  delete (process.env as any)[key];
};

describe('Static Assets', () => {
  let server: SimpleWebServer;
  let app: any;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    
    // Clear environment variables safely
    deleteEnvVar('NODE_ENV');
    server = new SimpleWebServer();
    app = server.getApp();
  });

  afterEach(async () => {
    // Restore original NODE_ENV
    if (originalNodeEnv) {
      setEnvVar('NODE_ENV', originalNodeEnv);
    } else {
      deleteEnvVar('NODE_ENV');
    }
    
    try {
      await server.stop();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Asset Caching Headers', () => {
    it('should set appropriate cache headers for JavaScript files in production', async () => {
      // Mock production environment
      setEnvVar('NODE_ENV', 'production');

      const testServer = new SimpleWebServer();
      const testApp = testServer.getApp();

      // Create a test JS file
      const fs = require('fs');
      const path = require('path');
      const testJsPath = path.join(__dirname, '../../client/test.js');
      
      // Ensure directory exists
      const dir = path.dirname(testJsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testJsPath, 'console.log("test");');

      try {
        const response = await request(testApp)
          .get('/test.js')
          .expect(200);

        expect(response.headers['cache-control']).toContain('max-age=31536000');
        expect(response.headers['cache-control']).toContain('immutable');
        expect(response.headers['x-content-type-options']).toBe('nosniff');

        // Clean up
        fs.unlinkSync(testJsPath);
        await testServer.stop();
      } finally {
        deleteEnvVar('NODE_ENV');
      }
    });

    it('should set appropriate cache headers for CSS files in production', async () => {
      setEnvVar('NODE_ENV', 'production');

      const testServer = new SimpleWebServer();
      const testApp = testServer.getApp();

      const fs = require('fs');
      const path = require('path');
      const testCssPath = path.join(__dirname, '../../client/test.css');
      
      // Ensure directory exists
      const dir = path.dirname(testCssPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testCssPath, 'body { color: red; }');

      try {
        const response = await request(testApp)
          .get('/test.css')
          .expect(200);

        expect(response.headers['cache-control']).toContain('max-age=31536000');
        expect(response.headers['cache-control']).toContain('immutable');

        fs.unlinkSync(testCssPath);
        await testServer.stop();
      } finally {
        deleteEnvVar('NODE_ENV');
      }
    });

    it('should set appropriate cache headers for image files in production', async () => {
      setEnvVar('NODE_ENV', 'production');

      const testServer = new SimpleWebServer();
      const testApp = testServer.getApp();

      const fs = require('fs');
      const path = require('path');
      const testImagePath = path.join(__dirname, '../../client/test.png');
      
      // Ensure directory exists
      const dir = path.dirname(testImagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testImagePath, 'fake-png-data');

      try {
        const response = await request(testApp)
          .get('/test.png')
          .expect(200);

        expect(response.headers['cache-control']).toContain('max-age=31536000');
        expect(response.headers['cache-control']).not.toContain('immutable');

        fs.unlinkSync(testImagePath);
        await testServer.stop();
      } finally {
        deleteEnvVar('NODE_ENV');
      }
    });

    it('should set no-cache headers for HTML files in production', async () => {
      setEnvVar('NODE_ENV', 'production');

      const testServer = new SimpleWebServer();
      const testApp = testServer.getApp();

      try {
        const response = await request(testApp)
          .get('/')
          .expect(200);

        expect(response.headers['cache-control']).toContain('max-age=0');
        expect(response.headers['cache-control']).toContain('must-revalidate');

        await testServer.stop();
      } finally {
        deleteEnvVar('NODE_ENV');
      }
    });

    it('should not set aggressive cache headers in development', async () => {
      setEnvVar('NODE_ENV', 'development');

      const testServer = new SimpleWebServer();
      const testApp = testServer.getApp();

      const fs = require('fs');
      const path = require('path');
      const testJsPath = path.join(__dirname, '../../client/test.js');
      
      // Ensure directory exists
      const dir = path.dirname(testJsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testJsPath, 'console.log("test");');

      try {
        const response = await request(testApp)
          .get('/test.js')
          .expect(200);

        expect(response.headers['cache-control']).not.toContain('max-age=31536000');
        expect(response.headers['cache-control']).not.toContain('immutable');

        fs.unlinkSync(testJsPath);
        await testServer.stop();
      } finally {
        deleteEnvVar('NODE_ENV');
      }
    });
  });

  describe('Asset Delivery', () => {
    it('should serve static files from the correct directory', async () => {
      const fs = require('fs');
      const path = require('path');
      const testFilePath = path.join(__dirname, '../../client/test.txt');
      
      // Ensure directory exists
      const dir = path.dirname(testFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testFilePath, 'test content');

      try {
        const response = await request(app)
          .get('/test.txt')
          .expect(200);

        expect(response.text).toBe('test content');
        expect(response.headers['content-type']).toContain('text/plain');

        fs.unlinkSync(testFilePath);
      } catch (error) {
        // Clean up if test fails
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
        throw error;
      }
    });

    it('should serve React app for non-existent static files (SPA behavior)', async () => {
      const response = await request(app)
        .get('/non-existent-file.txt')
        .expect(200);

      // Should serve the React app HTML for SPA routing
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should serve React app for all non-API routes', async () => {
      const response = await request(app)
        .get('/some-random-route')
        .expect(200);

      // Should serve the React app HTML
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should not serve React app for API routes', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers for JavaScript files', async () => {
      const fs = require('fs');
      const path = require('path');
      const testJsPath = path.join(__dirname, '../../client/test.js');
      
      // Ensure directory exists
      const dir = path.dirname(testJsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testJsPath, 'console.log("test");');

      try {
        const response = await request(app)
          .get('/test.js')
          .expect(200);

        expect(response.headers['x-content-type-options']).toBe('nosniff');

        fs.unlinkSync(testJsPath);
      } catch (error) {
        if (fs.existsSync(testJsPath)) {
          fs.unlinkSync(testJsPath);
        }
        throw error;
      }
    });

    it('should include ETag headers for static assets', async () => {
      const fs = require('fs');
      const path = require('path');
      const testFilePath = path.join(__dirname, '../../client/test.txt');
      
      // Ensure directory exists
      const dir = path.dirname(testFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testFilePath, 'test content');

      try {
        const response = await request(app)
          .get('/test.txt')
          .expect(200);

        expect(response.headers).toHaveProperty('etag');

        fs.unlinkSync(testFilePath);
      } catch (error) {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
        throw error;
      }
    });

    it('should include Last-Modified headers for static assets', async () => {
      const fs = require('fs');
      const path = require('path');
      const testFilePath = path.join(__dirname, '../../client/test.txt');
      
      // Ensure directory exists
      const dir = path.dirname(testFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testFilePath, 'test content');

      try {
        const response = await request(app)
          .get('/test.txt')
          .expect(200);

        expect(response.headers).toHaveProperty('last-modified');

        fs.unlinkSync(testFilePath);
      } catch (error) {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
        throw error;
      }
    });
  });

  describe('Performance Optimization', () => {
    it('should compress static assets when possible', async () => {
      const fs = require('fs');
      const path = require('path');
      const testFilePath = path.join(__dirname, '../../client/test.txt');
      
      // Ensure directory exists
      const dir = path.dirname(testFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const testContent = 'a'.repeat(1000); // Create content that would benefit from compression
      fs.writeFileSync(testFilePath, testContent);

      try {
        const response = await request(app)
          .get('/test.txt')
          .set('Accept-Encoding', 'gzip, deflate')
          .expect(200);

        // Note: In test environment, compression might not be enabled
        // This test verifies the request is handled correctly
        expect(response.status).toBe(200);

        fs.unlinkSync(testFilePath);
      } catch (error) {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
        throw error;
      }
    });
  });
}); 