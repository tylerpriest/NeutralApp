import request from 'supertest';
import express from 'express';

// Mock Supabase modules
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
  SupabaseClient: jest.fn()
}));

import { SimpleWebServer } from '../SimpleWebServer';
import { SimpleAPIRouter } from '../SimpleAPIRouter';

describe('API Integration Tests', () => {
  let server: SimpleWebServer;
  let app: express.Application;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    delete process.env.SUPABASE_URL;
    
    server = new SimpleWebServer();
    app = server.getApp();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('id');
        expect(response.body.data.user).toHaveProperty('email', userData.email);
        expect(response.body).toHaveProperty('message', 'Registration successful.');
      });

      it('should return 400 for invalid registration data', async () => {
        const invalidData = {
          email: 'invalid-email',
          password: '123' // too short
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login user successfully', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body).toHaveProperty('message', 'Login successful');
      });

      it('should return 401 for invalid credentials', async () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Logout successful');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user profile', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email');
      });
    });
  });

  describe('Plugin Management Endpoints', () => {
    describe('GET /api/plugins', () => {
      it('should return available plugins', async () => {
        const response = await request(app)
          .get('/api/plugins')
          .expect(200);

        expect(response.body).toHaveProperty('available');
        expect(response.body).toHaveProperty('installed');
        expect(Array.isArray(response.body.available)).toBe(true);
        expect(Array.isArray(response.body.installed)).toBe(true);
      });
    });

    describe('POST /api/plugins/install', () => {
      it('should install a plugin successfully', async () => {
        const pluginData = {
          pluginId: 'test-plugin',
          version: '1.0.0'
        };

        const response = await request(app)
          .post('/api/plugins/install')
          .send(pluginData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Plugin installed successfully');
        expect(response.body).toHaveProperty('plugin');
      });

      it('should return 400 for invalid plugin data', async () => {
        const invalidData = {
          pluginId: ''
        };

        const response = await request(app)
          .post('/api/plugins/install')
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('DELETE /api/plugins/:pluginId', () => {
      it('should uninstall a plugin successfully', async () => {
        const pluginId = 'test-plugin';

        const response = await request(app)
          .delete(`/api/plugins/${pluginId}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Plugin uninstalled successfully');
      });

      it('should return 404 for non-existent plugin', async () => {
        const pluginId = 'non-existent-plugin';

        const response = await request(app)
          .delete(`/api/plugins/${pluginId}`)
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('PUT /api/plugins/:pluginId', () => {
      it('should enable/disable a plugin successfully', async () => {
        const pluginId = 'test-plugin';
        const action = { enabled: true };

        const response = await request(app)
          .put(`/api/plugins/${pluginId}`)
          .send(action)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('plugin');
      });
    });
  });

  describe('Settings Management Endpoints', () => {
    describe('GET /api/settings', () => {
      it('should return all settings', async () => {
        const response = await request(app)
          .get('/api/settings')
          .expect(200);

        expect(response.body).toHaveProperty('settings');
        expect(typeof response.body.settings).toBe('object');
      });
    });

    describe('GET /api/settings/:key', () => {
      it('should return specific setting', async () => {
        const key = 'theme';

        const response = await request(app)
          .get(`/api/settings/${key}`)
          .expect(200);

        expect(response.body).toHaveProperty('key', key);
        expect(response.body).toHaveProperty('value');
      });

      it('should return 404 for non-existent setting', async () => {
        const key = 'non-existent-setting';

        const response = await request(app)
          .get(`/api/settings/${key}`)
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('PUT /api/settings/:key', () => {
      it('should update setting successfully', async () => {
        const key = 'theme';
        const value = { mode: 'dark' };

        const response = await request(app)
          .put(`/api/settings/${key}`)
          .send({ value })
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Setting updated successfully');
        expect(response.body).toHaveProperty('setting');
        expect(response.body.setting).toHaveProperty('key', key);
        expect(response.body.setting).toHaveProperty('value', value);
      });

      it('should return 400 for invalid setting value', async () => {
        const key = 'theme';
        const invalidValue = null;

        const response = await request(app)
          .put(`/api/settings/${key}`)
          .send({ value: invalidValue })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('DELETE /api/settings/:key', () => {
      it('should delete setting successfully', async () => {
        const key = 'temp-setting';

        const response = await request(app)
          .delete(`/api/settings/${key}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Setting deleted successfully');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS and Security', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/plugins')
        .set('Origin', 'http://localhost:3001')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/plugins')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });
}); 