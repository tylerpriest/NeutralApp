import request from 'supertest';
import { WebServer } from '../WebServer';
import fs from 'fs';
import path from 'path';

describe('Static Assets', () => {
  let server: WebServer;
  let app: any;
  let buildPath: string;

  beforeAll(async () => {
    // Ensure build directory exists with mock index.html
    // WebServer serves from: src/dist/web/client in dev, ../client in prod
    buildPath = path.join(__dirname, '../../../../src/dist/web/client');
    if (!fs.existsSync(buildPath)) {
      fs.mkdirSync(buildPath, { recursive: true });
    }
    
    // Create mock index.html for React app
    const indexHtmlPath = path.join(buildPath, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      fs.writeFileSync(indexHtmlPath, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NeutralApp - Test</title>
</head>
<body>
  <div id="root">NeutralApp Test</div>
</body>
</html>`);
    }

    server = new WebServer();
    app = server.getApp();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Asset Delivery', () => {
    it('should serve static files from the correct directory', async () => {
      // Create a test file in the expected build directory
      const testFilePath = path.join(buildPath, 'test.txt');
      
      fs.writeFileSync(testFilePath, 'test content');

      try {
        const response = await request(app)
          .get('/test.txt')
          .expect(200);

        expect(response.text).toBe('test content');
        expect(response.headers['content-type']).toContain('text/plain');
      } finally {
        // Cleanup
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    }, 5000);

    it('should serve index.html for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('NeutralApp');
    });

    it('should not serve API routes as static files', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'API endpoint not found');
    });
  });

  describe('Asset Caching Headers', () => {
    it('should set appropriate cache headers for static files', async () => {
      const testJsPath = path.join(buildPath, 'test.js');
      
      fs.writeFileSync(testJsPath, 'console.log("test");');

      try {
        const response = await request(app)
          .get('/test.js')
          .expect(200);

        // Express static serves files with basic cache headers
        expect(response.headers['cache-control']).toBeDefined();
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      } finally {
        if (fs.existsSync(testJsPath)) {
          fs.unlinkSync(testJsPath);
        }
      }
    });

    it('should handle missing files gracefully', async () => {
      const response = await request(app)
        .get('/nonexistent-file.js')
        .expect(200); // React SPA serves index.html for all non-API routes

      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('Content Type Detection', () => {
    it('should serve JavaScript files with correct content type', async () => {
      const testJsPath = path.join(buildPath, 'script.js');
      
      fs.writeFileSync(testJsPath, 'console.log("test");');

      try {
        const response = await request(app)
          .get('/script.js')
          .expect(200);

        expect(response.headers['content-type']).toContain('application/javascript');
      } finally {
        if (fs.existsSync(testJsPath)) {
          fs.unlinkSync(testJsPath);
        }
      }
    });

    it('should serve CSS files with correct content type', async () => {
      const testCssPath = path.join(buildPath, 'style.css');
      
      fs.writeFileSync(testCssPath, 'body { color: red; }');

      try {
        const response = await request(app)
          .get('/style.css')
          .expect(200);

        expect(response.headers['content-type']).toContain('text/css');
      } finally {
        if (fs.existsSync(testCssPath)) {
          fs.unlinkSync(testCssPath);
        }
      }
    });
  });
}); 